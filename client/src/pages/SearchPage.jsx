import React, { useEffect, useState } from "react";
import CardLoading from "../components/CardLoading";
import SummaryApi from "../common/SummaryApi";
import Axios from "../utils/Axios";
import AxiosToastError from "../utils/AxiosToastError";
import CardProduct from "../components/CardProduct";
import InfiniteScroll from "react-infinite-scroll-component";
import { useLocation } from "react-router-dom";
import noDataImage from "../assets/nothing here yet.webp";

const SearchPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadingArrayCard = new Array(10).fill(null);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const params = useLocation();
  const searchText = params?.search?.slice(3);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.searchProduct,
        data: {
          search: searchText,
          page: page,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        if (responseData.page == 1) {
          setData(responseData.data);
        } else {
          setData((preve) => {
            return [...preve, ...responseData.data];
          });
        }
        setTotalPage(responseData.totalPage);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, searchText]);

  const handleFetchMore = () => {
    if (totalPage > page) {
      setPage((pre) => pre + 1);
    }
  };
  return (
    <section className="bg-white">
      <div className="container mx-auto p-4">
        <p className="font-semibold">Kết quả tìm kiếm: {data.length}</p>
        <InfiniteScroll
          dataLength={data.length}
          hasMore={true}
          next={handleFetchMore}
        >
          <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {data.map((p, index) => {
              return (
                <CardProduct data={p} key={p?._id + "searchProduct" + index} />
              );
            })}

            {/* loading data */}
            {loading &&
              loadingArrayCard.map((_, index) => {
                return <CardLoading key={"loadingsearchpage" + index} />;
              })}
          </div>
        </InfiniteScroll>

        {
          //no data
          !data[0] && !loading && (
            <div className="mx-auto flex w-full flex-col items-center justify-center">
              <img
                src={noDataImage}
                className="max-h-xs block h-full w-full max-w-xs"
              />
              <p className="my-2 font-semibold">Không tìm thấy kết quả</p>
            </div>
          )
        }
      </div>
    </section>
  );
};

export default SearchPage;
