import React, { useEffect, useState } from "react";
import UploadCategoryModel from "../components/UploadCategoryModel";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import Loading from "../components/Loading";
import NoData from "../components/NoData";

const CategoryPage = () => {
  const [openUploadCategory, setOpenUploadCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoryData, setCategoryData] = useState([]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getCategory,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        setCategoryData(responseData.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);
  return (
    <div>
      <section>
        <div className="flex items-center justify-between bg-white p-2 shadow-md">
          <h2 className="font-semibold">Category</h2>
          <button
            onClick={() => setOpenUploadCategory(true)}
            className="border-primary-200 hover:bg-primary-200 rounded border px-3 py-1 text-sm"
          >
            Add Category
          </button>
        </div>
        {!categoryData[0] && !loading && <NoData />}

        <div className="grid grid-cols-2 gap-2 p-4 md:grid-cols-4 lg:grid-cols-6">
          {categoryData.map((category, index) => {
            return (
              <div className="shadow-md' h-56 w-32 rounded">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full object-scale-down"
                />
              </div>
            );
          })}
        </div>

        {loading && <Loading />}

        {openUploadCategory && (
          <UploadCategoryModel
            fetchData={fetchCategory}
            close={() => setOpenUploadCategory(false)}
          />
        )}
      </section>
    </div>
  );
};

export default CategoryPage;
