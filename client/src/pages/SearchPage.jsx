import React, { useEffect, useState } from "react";
import CardLoading from "../components/CardLoading";
import SummaryApi from "../common/SummaryApi";
import Axios from "../utils/Axios";
import AxiosToastError from "../utils/AxiosToastError";
import CardProduct from "../components/CardProduct";
import InfiniteScroll from "react-infinite-scroll-component";
import { useLocation } from "react-router-dom";
import noDataImage from "../assets/nothing here yet.webp";
import {
  FaFilter,
  FaSort,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";

const SearchPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState(null);
  const [searchStats, setSearchStats] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const loadingArrayCard = new Array(10).fill(null);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState({
    min: "",
    max: "",
  });
  const [selectedPriceBucket, setSelectedPriceBucket] = useState("");
  const [sortBy, setSortBy] = useState("relevance");

  const location = useLocation();
  const params = useLocation();
  const searchText = params?.search?.slice(3);

  // Fetch search filters on component mount
  useEffect(() => {
    fetchSearchFilters();
  }, [searchText]);

  // Fetch data when search params change
  useEffect(() => {
    setData([]);
    setPage(1);
    fetchData(true);
  }, [
    searchText,
    selectedCategories,
    selectedPriceRange,
    selectedPriceBucket,
    sortBy,
  ]);

  const fetchSearchFilters = async () => {
    try {
      const response = await Axios({
        url: `${SummaryApi.getSearchFilters.url}?search=${encodeURIComponent(searchText || "")}`,
        method: SummaryApi.getSearchFilters.method || "get",
      });

      if (response.data.success) {
        setSearchFilters(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching search filters:", error);
    }
  };

  const fetchData = async (reset = false) => {
    try {
      setLoading(true);

      // Build filter object
      const filters = {
        search: searchText,
        page: reset ? 1 : page,
        limit: 12,
        sortBy: sortBy,
      };

      // Add category filter
      if (selectedCategories.length > 0) {
        filters.category = selectedCategories;
      }

      // Add price filter
      if (selectedPriceBucket) {
        const bucket = searchFilters?.priceBuckets?.find(
          (b) => b.label === selectedPriceBucket,
        );
        if (bucket) {
          filters.priceRange = { min: bucket.min, max: bucket.max };
        }
      } else if (selectedPriceRange.min || selectedPriceRange.max) {
        filters.priceRange = {
          min: selectedPriceRange.min
            ? Number(selectedPriceRange.min)
            : undefined,
          max: selectedPriceRange.max
            ? Number(selectedPriceRange.max)
            : undefined,
        };
      }

      const response = await Axios({
        ...SummaryApi.searchProduct,
        data: filters,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        const newData = responseData.data;

        if (reset || page === 1) {
          setData(newData);
        } else {
          setData((prevData) => [...prevData, ...newData]);
        }

        setTotalPage(responseData.totalPage);
        setSearchStats(responseData.searchStats);
        setSuggestions(responseData.suggestions || []);
        setHasMore(page < responseData.totalPage);

        if (!reset) {
          setPage((prevPage) => prevPage + 1);
        }
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMore = () => {
    if (!loading && hasMore) {
      fetchData(false);
    }
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handlePriceBucketChange = (bucketLabel) => {
    setSelectedPriceBucket((prev) => (prev === bucketLabel ? "" : bucketLabel));
    setSelectedPriceRange({ min: "", max: "" }); // Clear custom range
  };

  const handleCustomPriceRange = () => {
    setSelectedPriceBucket(""); // Clear bucket selection
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRange({ min: "", max: "" });
    setSelectedPriceBucket("");
    setSortBy("relevance");
  };

  const FilterSection = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
      <div className="mb-4 border-b border-gray-200 pb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mb-2 flex w-full items-center justify-between text-left font-medium text-gray-900"
        >
          {title}
          {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </button>
        {isOpen && children}
      </div>
    );
  };

  return (
    <section className="min-h-screen bg-white">
      <div className="container mx-auto p-4">
        {/* Search Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-xl font-semibold">
              {searchText
                ? `Kết quả tìm kiếm: "${searchText}"`
                : "Tất cả sản phẩm"}
            </h1>
            {searchStats && (
              <p className="text-sm text-gray-600">
                Tìm thấy {searchStats.resultCount} sản phẩm
                {searchStats.priceRange && (
                  <span className="ml-2">
                    • Giá từ{" "}
                    {DisplayPriceInRupees(searchStats.priceRange.minPrice)}
                    đến {DisplayPriceInRupees(searchStats.priceRange.maxPrice)}
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Mobile Filter Toggle */}
          <div className="mt-3 flex items-center gap-3 md:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 md:hidden"
            >
              <FaFilter size={14} />
              Lọc
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
              {searchFilters?.sortOptions?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          {/* Filters Sidebar */}
          <div
            className={`md:w-64 md:flex-shrink-0 ${showFilters ? "block" : "hidden md:block"} `}
          >
            <div className="sticky top-24 rounded-lg border border-gray-200 bg-white p-4">
              {/* Filter Header */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Xóa tất cả
                </button>
              </div>

              {/* Active Filters */}
              {(selectedCategories.length > 0 ||
                selectedPriceBucket ||
                selectedPriceRange.min ||
                selectedPriceRange.max) && (
                <div className="mb-4 rounded-lg bg-gray-50 p-3">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Đang lọc:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((catId) => {
                      const category = searchFilters?.categories?.find(
                        (c) => c._id === catId,
                      );
                      return category ? (
                        <span
                          key={catId}
                          className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
                        >
                          {category.name}
                          <button onClick={() => handleCategoryFilter(catId)}>
                            <FaTimes size={10} />
                          </button>
                        </span>
                      ) : null;
                    })}
                    {selectedPriceBucket && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                        {selectedPriceBucket}
                        <button onClick={() => setSelectedPriceBucket("")}>
                          <FaTimes size={10} />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Categories Filter */}
              {searchFilters?.categories &&
                searchFilters.categories.length > 0 && (
                  <FilterSection title="Danh mục">
                    <div className="max-h-40 space-y-2 overflow-y-auto">
                      {searchFilters.categories.map((category) => (
                        <label
                          key={category._id}
                          className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category._id)}
                            onChange={() => handleCategoryFilter(category._id)}
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <div className="flex flex-1 items-center gap-2">
                            {category.image && (
                              <img
                                src={category.image}
                                alt=""
                                className="h-6 w-6 rounded object-cover"
                              />
                            )}
                            <span className="text-sm text-gray-700">
                              {category.name}
                            </span>
                            <span className="ml-auto text-xs text-gray-500">
                              ({category.count})
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </FilterSection>
                )}

              {/* Price Filter */}
              <FilterSection title="Khoảng giá">
                <div className="space-y-3">
                  {/* Price Buckets */}
                  {searchFilters?.priceBuckets?.map((bucket) => (
                    <label
                      key={bucket.label}
                      className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name="priceBucket"
                        checked={selectedPriceBucket === bucket.label}
                        onChange={() => handlePriceBucketChange(bucket.label)}
                        className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">
                        {bucket.label}
                      </span>
                    </label>
                  ))}

                  {/* Custom Price Range */}
                  <div className="border-t border-gray-200 pt-2">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Tùy chỉnh
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Từ"
                        value={selectedPriceRange.min}
                        onChange={(e) => {
                          setSelectedPriceRange((prev) => ({
                            ...prev,
                            min: e.target.value,
                          }));
                          handleCustomPriceRange();
                        }}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        placeholder="Đến"
                        value={selectedPriceRange.max}
                        onChange={(e) => {
                          setSelectedPriceRange((prev) => ({
                            ...prev,
                            max: e.target.value,
                          }));
                          handleCustomPriceRange();
                        }}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </FilterSection>

              {/* Quick Info */}
              {searchStats?.categoryBreakdown &&
                searchStats.categoryBreakdown.length > 0 && (
                  <FilterSection title="Thống kê danh mục" defaultOpen={false}>
                    <div className="space-y-2">
                      {searchStats.categoryBreakdown.slice(0, 5).map((stat) => (
                        <div
                          key={stat._id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-600">{stat.name}</span>
                          <span className="text-gray-500">{stat.count}</span>
                        </div>
                      ))}
                    </div>
                  </FilterSection>
                )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* No Results with Suggestions */}
            {!data.length && !loading && searchText && (
              <div className="py-12 text-center">
                <img
                  src={noDataImage}
                  className="mx-auto mb-6 block h-full max-h-64 w-full max-w-xs"
                  alt="Không tìm thấy kết quả"
                />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Không tìm thấy kết quả cho "{searchText}"
                </h3>
                <p className="mb-4 text-gray-600">
                  Hãy thử tìm kiếm với từ khóa khác hoặc xem gợi ý bên dưới
                </p>

                {/* Search Suggestions */}
                {suggestions.length > 0 && (
                  <div className="mx-auto max-w-md">
                    <h4 className="mb-3 text-sm font-medium text-gray-700">
                      Có thể bạn đang tìm:
                    </h4>
                    <div className="flex flex-wrap justify-center gap-2">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            const url = `/search?q=${encodeURIComponent(suggestion.text)}`;
                            window.location.href = url;
                          }}
                          className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700 transition-colors hover:bg-blue-100"
                        >
                          {suggestion.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Products Grid */}
            {data.length > 0 && (
              <InfiniteScroll
                dataLength={data.length}
                next={handleFetchMore}
                hasMore={hasMore}
                loader={null}
                endMessage={
                  <div className="py-8 text-center">
                    <p className="text-gray-500">
                      🎉 Bạn đã xem hết tất cả sản phẩm
                    </p>
                  </div>
                }
              >
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {data.map((product, index) => (
                    <CardProduct
                      data={product}
                      key={`${product._id}-search-${index}`}
                    />
                  ))}
                </div>
              </InfiniteScroll>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {loadingArrayCard.map((_, index) => (
                  <CardLoading key={`loading-search-${index}`} />
                ))}
              </div>
            )}

            {/* Empty State for No Search */}
            {!searchText && !loading && data.length === 0 && (
              <div className="py-12 text-center">
                <div className="mb-4 text-6xl">🔍</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Tìm kiếm sản phẩm
                </h3>
                <p className="text-gray-600">
                  Nhập từ khóa để tìm kiếm sản phẩm yêu thích
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Overlay */}
        {showFilters && (
          <div className="bg-opacity-50 fixed inset-0 z-50 bg-black md:hidden">
            <div className="fixed top-0 right-0 h-full w-80 overflow-y-auto bg-white">
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Bộ lọc</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                {/* Same filter content as sidebar */}
                {/* Categories Filter */}
                {searchFilters?.categories &&
                  searchFilters.categories.length > 0 && (
                    <FilterSection title="Danh mục">
                      <div className="space-y-2">
                        {searchFilters.categories.map((category) => (
                          <label
                            key={category._id}
                            className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(
                                category._id,
                              )}
                              onChange={() =>
                                handleCategoryFilter(category._id)
                              }
                              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">
                              {category.name}
                            </span>
                            <span className="ml-auto text-xs text-gray-500">
                              ({category.count})
                            </span>
                          </label>
                        ))}
                      </div>
                    </FilterSection>
                  )}

                {/* Price Filter for Mobile */}
                <FilterSection title="Khoảng giá">
                  <div className="space-y-3">
                    {searchFilters?.priceBuckets?.map((bucket) => (
                      <label
                        key={bucket.label}
                        className="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="priceBucketMobile"
                          checked={selectedPriceBucket === bucket.label}
                          onChange={() => handlePriceBucketChange(bucket.label)}
                          className="h-4 w-4 border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">
                          {bucket.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterSection>
              </div>

              {/* Mobile Filter Actions */}
              <div className="border-t bg-gray-50 p-4">
                <div className="flex gap-3">
                  <button
                    onClick={clearAllFilters}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Xóa bộ lọc
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchPage;
