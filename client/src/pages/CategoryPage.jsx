import React, { useEffect, useState } from "react";
import UploadCategoryModel from "../components/UploadCategoryModel";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import Loading from "../components/Loading";
import NoData from "../components/NoData";
import EditCategory from "../components/EditCategory";
import ConfirmBox from "../components/ConfirmBox";
import toast from "react-hot-toast";
import AxiosToastError from "../utils/AxiosToastError";
import { useSelector } from "react-redux";

const CategoryPage = () => {
  const [openUploadCategory, setOpenUploadCategory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    image: "",
  });

  const [openConfirmBoxDelete, setOpenConfirmBoxDelete] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState({
    _id: "",
  });
  // const allCategory = useSelector((state) => state.product.allCategory);

  // useEffect(() => {
  //   setCategoryData(allCategory);
  // }, [allCategory]);

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

  const handleDeleteCategory = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteCategory,
        data: deleteCategory,
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        fetchCategory();
        setOpenConfirmBoxDelete(false);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <div>
      <section>
        <div className="flex items-center justify-between bg-white p-2 shadow-md">
          <h2 className="font-semibold">Loại sản phẩm</h2>
          <button
            onClick={() => setOpenUploadCategory(true)}
            className="border-primary-200 hover:bg-primary-200 rounded border px-3 py-1 text-sm"
          >
            Thêm loại sản phẩm
          </button>
        </div>
        {!categoryData[0] && !loading && <NoData />}

        <div className="grid grid-cols-2 gap-2 p-4 md:grid-cols-4 lg:grid-cols-6">
          {categoryData.map((category, index) => {
            return (
              <div className="shadow-md' h-56 w-32 rounded" key={category._id}>
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full object-scale-down"
                />
                <div className="flex h-9 items-center gap-2">
                  <button
                    onClick={() => {
                      setOpenEdit(true);
                      setEditData(category);
                    }}
                    className="flex-1 rounded bg-green-100 py-1 font-medium text-green-600 hover:bg-green-200"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => {
                      setOpenConfirmBoxDelete(true);
                      setDeleteCategory(category);
                    }}
                    className="flex-1 rounded bg-red-100 py-1 font-medium text-red-600 hover:bg-red-200"
                  >
                    Xóa
                  </button>
                </div>
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

        {openEdit && (
          <EditCategory
            fetchData={fetchCategory}
            close={() => setOpenEdit(false)}
            data={editData}
          />
        )}

        {openConfirmBoxDelete && (
          <ConfirmBox
            close={() => setOpenConfirmBoxDelete(false)}
            cancel={() => setOpenConfirmBoxDelete(false)}
            confirm={handleDeleteCategory}
          />
        )}
      </section>
    </div>
  );
};

export default CategoryPage;
