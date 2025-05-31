import React, { useEffect, useState, useRef } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { IoSearch, IoClose } from "react-icons/io5";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import useMobile from "../hooks/useMobile";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import { useSelector } from "react-redux";

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchPage, setIsSearchPage] = useState(false);
  const [isMobile] = useMobile();
  const params = useLocation();
  const searchText = params.search.slice(3);

  // Enhanced search states
  const [searchQuery, setSearchQuery] = useState(searchText || "");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [popularSearches, setPopularSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  const allCategory = useSelector((state) => state.product.allCategory);
  const allSubCategory = useSelector((state) => state.product.allSubCategory);

  useEffect(() => {
    const isSearch = location.pathname === "/search";
    setIsSearchPage(isSearch);

    // Load search history from localStorage
    const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    setSearchHistory(history.slice(0, 5)); // Chỉ hiển thị 5 lịch sử gần nhất

    // Set popular searches
    setPopularSearches([
      "Sữa tươi",
      "Bánh mì",
      "Thịt heo",
      "Rau củ quả",
      "Gia vị",
      "Đồ uống",
      "Snack",
      "Mì gói",
    ]);
  }, [location]);

  // Debounced search suggestions
  const fetchSearchSuggestions = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.searchProduct,
        data: {
          search: query,
          page: 1,
          limit: 5,
        },
      });

      if (response.data.success) {
        const products = response.data.data;
        const suggestions = [];

        // Thêm sản phẩm khớp
        products.forEach((product) => {
          if (product.name.toLowerCase().includes(query.toLowerCase())) {
            suggestions.push({
              type: "product",
              text: product.name,
              id: product._id,
              image: product.image[0],
            });
          }
        });

        // Thêm danh mục khớp
        allCategory.forEach((category) => {
          if (category.name.toLowerCase().includes(query.toLowerCase())) {
            suggestions.push({
              type: "category",
              text: category.name,
              id: category._id,
              image: category.image,
            });
          }
        });

        // Thêm danh mục con khớp
        allSubCategory.forEach((subCategory) => {
          if (subCategory.name.toLowerCase().includes(query.toLowerCase())) {
            suggestions.push({
              type: "subcategory",
              text: subCategory.name,
              id: subCategory._id,
              image: subCategory.image,
            });
          }
        });

        // Thêm gợi ý từ khóa thông minh
        const keywordSuggestions = generateKeywordSuggestions(query);
        keywordSuggestions.forEach((keyword) => {
          suggestions.push({
            type: "keyword",
            text: keyword,
            id: `keyword_${keyword}`,
          });
        });

        // Loại bỏ trùng lặp và giới hạn số lượng
        const uniqueSuggestions = suggestions
          .filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.text === item.text),
          )
          .slice(0, 8);

        setSearchSuggestions(uniqueSuggestions);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate smart keyword suggestions
  const generateKeywordSuggestions = (query) => {
    const suggestions = [];
    const lowerQuery = query.toLowerCase();

    // Mapping từ khóa Việt Nam
    const keywordMappings = {
      sua: ["sữa tươi", "sữa đặc", "sữa chua", "sữa bột"],
      banh: ["bánh mì", "bánh quy", "bánh ngọt", "bánh tráng"],
      thit: ["thịt bò", "thịt heo", "thịt gà", "thịt cá"],
      ca: ["cá tươi", "cá khô", "cá hộp", "cá viên"],
      rau: ["rau xanh", "rau củ", "rau sạch", "rau organic"],
      gao: ["gạo tẻ", "gạo nàng hương", "gạo ST25", "gạo jasmine"],
      mi: ["mì gói", "mì tôm", "mì quảng", "mì chính"],
      nuoc: ["nước mắm", "nước tương", "nước ngọt", "nước lọc"],
      do: ["đồ uống", "đồ ăn vặt", "đồ hộp", "đồ đông lạnh"],
    };

    // Tìm gợi ý dựa trên từ khóa
    Object.keys(keywordMappings).forEach((key) => {
      if (lowerQuery.includes(key)) {
        keywordMappings[key].forEach((suggestion) => {
          if (
            !suggestions.includes(suggestion) &&
            suggestion.toLowerCase().includes(lowerQuery)
          ) {
            suggestions.push(suggestion);
          }
        });
      }
    });

    // Thêm gợi ý cho từ khóa phổ biến
    const commonPhrases = [
      `${query} tươi`,
      `${query} ngon`,
      `${query} giá rẻ`,
      `${query} chất lượng`,
      `${query} organic`,
      `${query} nhập khẩu`,
    ];

    commonPhrases.forEach((phrase) => {
      if (phrase.length <= 30) {
        suggestions.push(phrase);
      }
    });

    return suggestions.slice(0, 4);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      fetchSearchSuggestions(value);
    }, 300);

    setShowSuggestions(true);
  };

  const handleSearch = (query) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    // Save to search history
    const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    const newHistory = [
      searchTerm,
      ...history.filter((item) => item !== searchTerm),
    ];
    localStorage.setItem(
      "searchHistory",
      JSON.stringify(newHistory.slice(0, 10)),
    );
    setSearchHistory(newHistory.slice(0, 5));

    setShowSuggestions(false);
    const url = `/search?q=${encodeURIComponent(searchTerm)}`;
    navigate(url);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    const totalItems =
      searchSuggestions.length + searchHistory.length + popularSearches.length;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalItems);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev <= 0 ? totalItems - 1 : prev - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          const allItems = [
            ...searchSuggestions.map((s) => s.text),
            ...searchHistory,
            ...popularSearches,
          ];
          if (allItems[selectedIndex]) {
            handleSearch(allItems[selectedIndex]);
          }
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearSearchHistory = () => {
    localStorage.removeItem("searchHistory");
    setSearchHistory([]);
  };

  const removeHistoryItem = (item) => {
    const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    const newHistory = history.filter((h) => h !== item);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    setSearchHistory(newHistory.slice(0, 5));
  };

  const redirectToSearchPage = () => {
    navigate("/search");
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={suggestionsRef}>
      <div className="group focus-within:border-primary-200 flex h-11 w-full min-w-[300px] items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-neutral-500 lg:h-12 lg:min-w-[420px]">
        <div>
          {isMobile && isSearchPage ? (
            <Link
              to={"/"}
              className="group-focus-within:text-primary-200 m-1 flex h-full items-center justify-center rounded-full bg-white p-2 shadow-md"
            >
              <FaArrowLeft size={20} />
            </Link>
          ) : (
            <button
              className="group-focus-within:text-primary-200 flex h-full items-center justify-center p-3"
              onClick={() => handleSearch()}
            >
              <IoSearch size={22} />
            </button>
          )}
        </div>

        <div className="relative h-full w-full">
          {!isSearchPage ? (
            //not in search page
            <div
              onClick={redirectToSearchPage}
              className="flex h-full w-full cursor-pointer items-center"
            >
              <TypeAnimation
                sequence={[
                  'Tìm kiếm "Sữa tươi TH True Milk"',
                  2000,
                  'Tìm kiếm "Bánh mì sandwich"',
                  2000,
                  'Tìm kiếm "Thịt heo ba chỉ"',
                  2000,
                  'Tìm kiếm "Rau củ quả tươi"',
                  2000,
                  'Tìm kiếm "Mì gói Hảo Hảo"',
                  2000,
                  'Tìm kiếm "Nước mắm Phú Quốc"',
                  2000,
                  'Tìm kiếm "Cơm gạo ST25"',
                  2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                className="text-neutral-400"
              />
            </div>
          ) : (
            //when in search page
            <div className="relative h-full w-full">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                autoFocus
                value={searchQuery}
                className="h-full w-full bg-transparent pr-8 outline-none"
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
              />

              {/* Clear button */}
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowSuggestions(false);
                    searchInputRef.current?.focus();
                  }}
                  className="absolute top-1/2 right-2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                >
                  <IoClose size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && isSearchPage && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-[400px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Loading */}
          {loading && (
            <div className="p-3 text-center text-gray-500">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-gray-600"></div>
              <span className="ml-2">Đang tìm kiếm...</span>
            </div>
          )}

          {/* Search Suggestions */}
          {searchSuggestions.length > 0 && (
            <div>
              <div className="border-b p-2 text-xs font-semibold text-gray-500">
                Gợi ý tìm kiếm
              </div>
              {searchSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className={`flex cursor-pointer items-center p-3 hover:bg-gray-50 ${
                    selectedIndex === index ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.image && (
                    <img
                      src={suggestion.image}
                      alt=""
                      className="mr-3 h-8 w-8 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center">
                      <IoSearch className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="text-sm">{suggestion.text}</span>
                    </div>
                    {suggestion.type !== "keyword" && (
                      <span className="ml-6 text-xs text-gray-500">
                        {suggestion.type === "product" && "Sản phẩm"}
                        {suggestion.type === "category" && "Danh mục"}
                        {suggestion.type === "subcategory" && "Danh mục con"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && !loading && (
            <div>
              <div className="flex items-center justify-between border-b p-2 text-xs font-semibold text-gray-500">
                <span>Tìm kiếm gần đây</span>
                <button
                  onClick={clearSearchHistory}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Xóa tất cả
                </button>
              </div>
              {searchHistory.map((item, index) => (
                <div
                  key={`history-${index}`}
                  className={`flex cursor-pointer items-center justify-between p-3 hover:bg-gray-50 ${
                    selectedIndex === searchSuggestions.length + index
                      ? "bg-blue-50"
                      : ""
                  }`}
                  onClick={() => handleSearch(item)}
                >
                  <div className="flex items-center">
                    <IoSearch className="mr-2 h-4 w-4 text-gray-400" />
                    <span className="text-sm">{item}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHistoryItem(item);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <IoClose size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {!searchQuery && popularSearches.length > 0 && !loading && (
            <div>
              <div className="border-b p-2 text-xs font-semibold text-gray-500">
                Tìm kiếm phổ biến
              </div>
              {popularSearches.map((item, index) => (
                <div
                  key={`popular-${index}`}
                  className={`flex cursor-pointer items-center p-3 hover:bg-gray-50 ${
                    selectedIndex ===
                    searchSuggestions.length + searchHistory.length + index
                      ? "bg-blue-50"
                      : ""
                  }`}
                  onClick={() => handleSearch(item)}
                >
                  <IoSearch className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-sm">{item}</span>
                  <span className="ml-auto text-xs text-gray-400">🔥</span>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && searchQuery && searchSuggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <IoSearch className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              <p className="text-sm">Không tìm thấy kết quả phù hợp</p>
              <p className="mt-1 text-xs text-gray-400">
                Hãy thử tìm với từ khóa khác
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
