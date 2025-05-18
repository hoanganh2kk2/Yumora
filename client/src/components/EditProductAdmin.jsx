import React, { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadImage from "../utils/UploadImage";
import Loading from "../components/Loading";
import ViewImage from "../components/ViewImage";
import { MdDelete } from "react-icons/md";
import { useSelector } from "react-redux";
import { IoClose } from "react-icons/io5";
import AddFieldComponent from "../components/AddFieldComponent";
import Axios from "../utils/Axios";
import SummaryApi from "../common/SummaryApi";
import AxiosToastError from "../utils/AxiosToastError";
import successAlert from "../utils/SuccessAlert";
import toast from "react-hot-toast";

const EditProductAdmin = ({ close, data: propsData, fetchProductData }) => {
  const [data, setData] = useState({
    _id: propsData._id,
    name: propsData.name,
    image: propsData.image,
    category: propsData.category,
    subCategory: propsData.subCategory,
    unit: propsData.unit,
    stock: propsData.stock,
    price: propsData.price,
    discount: propsData.discount,
    description: propsData.description,
    more_details: propsData.more_details || {},
  });
  const [errors, setErrors] = useState({});
  const [imageLoading, setImageLoading] = useState(false);
  const [ViewImageURL, setViewImageURL] = useState("");
  const allCategory = useSelector((state) => state.product.allCategory);
  const [selectCategory, setSelectCategory] = useState("");
  const [selectSubCategory, setSelectSubCategory] = useState("");
  const allSubCategory = useSelector((state) => state.product.allSubCategory);

  const [openAddField, setOpenAddField] = useState(false);
  const [fieldName, setFieldName] = useState("");

  const validateInput = () => {
    const newErrors = {};

    // Kiểm tra tên
    if (!data.name.trim()) {
      newErrors.name = "Vui lòng nhập tên sản phẩm";
    }

    // Kiểm tra hình ảnh
    if (data.image.length === 0) {
      newErrors.image = "Vui lòng tải lên ít nhất một hình ảnh";
    }

    // Kiểm tra danh mục
    if (data.category.length === 0) {
      newErrors.category = "Vui lòng chọn loại sản phẩm";
    }

    // Kiểm tra danh mục con
    if (data.subCategory.length === 0) {
      newErrors.subCategory = "Vui lòng chọn danh mục sản phẩm";
    }

    // Kiểm tra đơn vị
    if (!data.unit.trim()) {
      newErrors.unit = "Vui lòng nhập khối lượng sản phẩm";
    } else if (data.unit.trim().startsWith("-")) {
      newErrors.unit = "Khối lượng không thể là giá trị âm";
    }

    // Kiểm tra số lượng
    if (!data.stock) {
      newErrors.stock = "Vui lòng nhập số lượng sản phẩm";
    } else if (isNaN(data.stock) || Number(data.stock) < 0) {
      newErrors.stock = "Số lượng sản phẩm phải là số dương";
    }

    // Kiểm tra giá
    if (!data.price) {
      newErrors.price = "Vui lòng nhập giá sản phẩm";
    } else if (isNaN(data.price) || Number(data.price) <= 0) {
      newErrors.price = "Giá sản phẩm phải là số dương";
    }

    // Kiểm tra giảm giá
    if (
      data.discount &&
      (isNaN(data.discount) ||
        Number(data.discount) < 0 ||
        Number(data.discount) > 100)
    ) {
      newErrors.discount = "Giảm giá phải là số từ 0 đến 100";
    }

    // Kiểm tra mô tả
    if (!data.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả sản phẩm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Xóa lỗi khi người dùng nhập lại giá trị
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }

    // Kiểm tra dữ liệu đầu vào ngay lập tức cho một số trường
    if (name === "stock" || name === "price" || name === "discount") {
      // Đảm bảo rằng người dùng không thể nhập giá trị âm
      if (value && Number(value) < 0) {
        // Không cập nhật giá trị nếu là số âm
        return;
      }
    }

    // Kiểm tra trường unit để không cho phép giá trị âm
    if (name === "unit") {
      // Nếu giá trị bắt đầu bằng dấu "-", ngăn không cho cập nhật
      if (value.trim().startsWith("-")) {
        // Thêm lỗi và không cập nhật giá trị
        setErrors({
          ...errors,
          unit: "Khối lượng không thể là giá trị âm",
        });
        return;
      }
    }

    setData((pre) => {
      return {
        ...pre,
        [name]: value,
      };
    });
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }
    setImageLoading(true);
    const response = await uploadImage(file);
    const { data: ImageResponse } = response;
    const imageUrl = ImageResponse.data.url;

    setData((pre) => {
      return {
        ...pre,
        image: [...pre.image, imageUrl],
      };
    });

    // Xóa lỗi hình ảnh nếu có
    if (errors.image) {
      setErrors({
        ...errors,
        image: null,
      });
    }

    setImageLoading(false);
  };

  const handleDeleteImage = async (index) => {
    data.image.splice(index, 1);
    setData((pre) => {
      return {
        ...pre,
      };
    });

    // Kiểm tra lại lỗi hình ảnh nếu xóa hết hình
    if (data.image.length === 0) {
      setErrors({
        ...errors,
        image: "Vui lòng tải lên ít nhất một hình ảnh",
      });
    }
  };

  const handleRemoveCategory = async (index) => {
    data.category.splice(index, 1);
    setData((pre) => {
      return {
        ...pre,
      };
    });

    // Kiểm tra lại lỗi danh mục nếu xóa hết danh mục
    if (data.category.length === 0) {
      setErrors({
        ...errors,
        category: "Vui lòng chọn loại sản phẩm",
      });
    }
  };

  const handleRemoveSubCategory = async (index) => {
    data.subCategory.splice(index, 1);
    setData((pre) => {
      return {
        ...pre,
      };
    });

    // Kiểm tra lại lỗi danh mục con nếu xóa hết danh mục con
    if (data.subCategory.length === 0) {
      setErrors({
        ...errors,
        subCategory: "Vui lòng chọn danh mục sản phẩm",
      });
    }
  };

  const handleAddField = () => {
    if (!fieldName.trim()) {
      toast.error("Vui lòng nhập tên trường");
      return;
    }

    setData((pre) => {
      return {
        ...pre,
        more_details: {
          ...pre.more_details,
          [fieldName]: "",
        },
      };
    });
    setFieldName("");
    setOpenAddField(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Xác thực dữ liệu trước khi gửi
    if (!validateInput()) {
      // Hiển thị thông báo lỗi tổng quát
      toast.error("Vui lòng kiểm tra lại thông tin sản phẩm");
      return;
    }

    try {
      const response = await Axios({
        ...SummaryApi.updateProductDetails,
        data: data,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        successAlert(responseData.message);
        if (close) {
          close();
        }
        fetchProductData();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <section className="fixed top-0 right-0 bottom-0 left-0 z-50 bg-black/70 p-4">
      <div className="mx-auto h-full max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded bg-white p-4">
        <section className="">
          <div className="flex items-center justify-between bg-white p-2 shadow-md">
            <h2 className="font-semibold">Sửa thông tin sản phẩm</h2>
            <button onClick={close}>
              <IoClose size={20} />
            </button>
          </div>
          <div className="grid p-3">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-1">
                <label htmlFor="name" className="font-medium">
                  Tên
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Nhập tên sản phẩm"
                  name="name"
                  value={data.name}
                  onChange={handleChange}
                  className={`focus-within:border-primary-200 rounded border ${errors.name ? "border-red-500" : "border-slate-200"} bg-blue-50 p-2 outline-none`}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
              <div className="grid gap-1">
                <label htmlFor="description" className="font-medium">
                  Miêu tả
                </label>
                <textarea
                  id="description"
                  type="text"
                  placeholder="Nhập miêu tả sản phẩm"
                  name="description"
                  value={data.description}
                  onChange={handleChange}
                  multiple
                  rows={3}
                  className={`focus-within:border-primary-200 resize-none rounded border ${errors.description ? "border-red-500" : "border-slate-200"} bg-blue-50 p-2 outline-none`}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>
              <div>
                <p className="font-medium">Hình ảnh</p>
                <div>
                  <label
                    htmlFor="productImage"
                    className={`flex h-24 cursor-pointer items-center justify-center rounded border ${errors.image ? "border-red-500" : "border-slate-200"} bg-blue-50`}
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      {imageLoading ? (
                        <Loading />
                      ) : (
                        <>
                          <FaCloudUploadAlt size={35} />
                          <p>Tải hình ảnh lên</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      id="productImage"
                      className="hidden"
                      accept="image/*"
                      onChange={handleUploadImage}
                    />
                  </label>
                  {errors.image && (
                    <p className="mt-1 text-sm text-red-500">{errors.image}</p>
                  )}
                  {/**display uploaded image*/}
                  <div className="flex flex-wrap gap-4">
                    {data.image.map((img, index) => {
                      return (
                        <div
                          key={img + index}
                          className="group relative mt-1 h-20 w-20 min-w-20 border border-slate-200 bg-blue-50"
                        >
                          <img
                            src={img}
                            alt={img}
                            className="h-full w-full cursor-pointer object-scale-down"
                            onClick={() => setViewImageURL(img)}
                          />
                          <div
                            onClick={() => handleDeleteImage(index)}
                            className="absolute right-0 bottom-0 hidden cursor-pointer rounded bg-red-600 p-1 text-white group-hover:block hover:bg-red-600"
                          >
                            <MdDelete />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="grid gap-1">
                <label className="font-medium">Loại sản phẩm</label>
                <div>
                  <select
                    className={`w-full rounded border ${errors.category ? "border-red-500" : "border-slate-200"} bg-blue-50 p-2`}
                    value={selectCategory}
                    onChange={(e) => {
                      const value = e.target.value;
                      const category = allCategory.find(
                        (el) => el._id === value,
                      );

                      setData((pre) => {
                        return {
                          ...pre,
                          category: [...pre.category, category],
                        };
                      });
                      setSelectCategory("");

                      // Xóa lỗi danh mục
                      if (errors.category) {
                        setErrors({
                          ...errors,
                          category: null,
                        });
                      }
                    }}
                  >
                    <option value={""}>Chọn loại sản phẩm</option>
                    {allCategory.map((c, index) => {
                      return (
                        <option key={c._id} value={c?._id}>
                          {c.name}
                        </option>
                      );
                    })}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.category}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {data.category.map((c, index) => {
                      return (
                        <div
                          key={c._id + index + "productSection"}
                          className="mt-2 flex items-center gap-1 bg-blue-50 text-sm"
                        >
                          <p>{c.name}</p>
                          <div
                            className="cursor-pointer hover:text-red-500"
                            onClick={() => handleRemoveCategory(index)}
                          >
                            <IoClose size={20} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="grid gap-1">
                <label className="font-medium">Danh mục sản phẩm</label>
                <div>
                  <select
                    className={`w-full rounded border ${errors.subCategory ? "border-red-500" : "border-slate-200"} bg-blue-50 p-2`}
                    value={selectSubCategory}
                    onChange={(e) => {
                      const value = e.target.value;
                      const subCategory = allSubCategory.find(
                        (el) => el._id === value,
                      );

                      if (
                        subCategory &&
                        !data.subCategory.find(
                          (sc) => sc._id === subCategory._id,
                        )
                      ) {
                        setData((pre) => ({
                          ...pre,
                          subCategory: [...pre.subCategory, subCategory],
                        }));
                      }

                      setSelectSubCategory("");

                      // Xóa lỗi danh mục con
                      if (errors.subCategory) {
                        setErrors({
                          ...errors,
                          subCategory: null,
                        });
                      }
                    }}
                  >
                    <option value={""} className="text-neutral-600">
                      Chọn danh mục sản phẩm
                    </option>

                    {allSubCategory.map((c, index) => {
                      return (
                        <option key={c._id} value={c?._id}>
                          {c.name}
                        </option>
                      );
                    })}
                  </select>
                  {errors.subCategory && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.subCategory}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {data.subCategory.map((c, index) => {
                      return (
                        <div
                          key={c._id + index + "productSection"}
                          className="mt-2 flex items-center gap-1 bg-blue-50 text-sm"
                        >
                          <p>{c.name}</p>
                          <div
                            className="cursor-pointer hover:text-red-500"
                            onClick={() => handleRemoveSubCategory(index)}
                          >
                            <IoClose size={20} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid gap-1">
                <label className="font-medium" htmlFor="unit">
                  Khối lượng
                </label>
                <input
                  id="unit"
                  type="text"
                  placeholder="Nhập khối lượng sản phẩm"
                  name="unit"
                  value={data.unit}
                  onChange={handleChange}
                  className={`focus-within:border-primary-200 rounded border ${errors.unit ? "border-red-500" : "border-slate-200"} bg-blue-50 p-2 outline-none`}
                />
                {errors.unit && (
                  <p className="text-sm text-red-500">{errors.unit}</p>
                )}
              </div>

              <div className="grid gap-1">
                <label className="font-medium" htmlFor="stock">
                  Số lượng sản phẩm
                </label>
                <input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="Nhập số lượng sản phẩm"
                  name="stock"
                  value={data.stock}
                  onChange={handleChange}
                  className={`focus-within:border-primary-200 rounded border ${errors.stock ? "border-red-500" : "border-slate-200"} bg-blue-50 p-2 outline-none`}
                />
                {errors.stock && (
                  <p className="text-sm text-red-500">{errors.stock}</p>
                )}
              </div>

              <div className="grid gap-1">
                <label className="font-medium" htmlFor="price">
                  Giá tiền
                </label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  placeholder="Nhập giá sản phẩm"
                  name="price"
                  value={data.price}
                  onChange={handleChange}
                  className={`focus-within:border-primary-200 border-slate-200r rounded border ${errors.price ? "border-red-500" : "border-slate-200"} bg-blue-50 p-2 outline-none`}
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price}</p>
                )}
              </div>

              <div className="grid gap-1">
                <label className="font-medium" htmlFor="discount">
                  Giảm giá
                </label>
                <input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Nhập giảm giá sản phẩm"
                  name="discount"
                  value={data.discount}
                  onChange={handleChange}
                  className={`focus-within:border-primary-200 rounded border ${errors.discount ? "border-red-500" : "border-slate-200"} bg-blue-50 p-2 outline-none`}
                />
                {errors.discount && (
                  <p className="text-sm text-red-500">{errors.discount}</p>
                )}
              </div>

              {/**add more field**/}
              {Object?.keys(data?.more_details)?.map((k, index) => {
                return (
                  <div className="grid gap-1" key={k}>
                    <label htmlFor={k} className="font-medium">
                      {k}
                    </label>
                    <input
                      id={k}
                      type="text"
                      value={data?.more_details[k]}
                      onChange={(e) => {
                        const value = e.target.value;
                        setData((pre) => {
                          return {
                            ...pre,
                            more_details: {
                              ...pre.more_details,
                              [k]: value,
                            },
                          };
                        });
                      }}
                      className="focus-within:border-primary-200 rounded border border-slate-200 bg-blue-50 p-2 outline-none"
                    />
                  </div>
                );
              })}

              <div
                onClick={() => setOpenAddField(true)}
                className="hover:bg-primary-200 border-primary-200 w-32 cursor-pointer rounded border bg-white px-3 py-1 text-center font-semibold hover:text-neutral-900"
              >
                Thêm
              </div>

              <button className="bg-primary-100 hover:bg-primary-200 rounded py-2 font-semibold">
                Cập nhật
              </button>
            </form>
          </div>

          {ViewImageURL && (
            <ViewImage url={ViewImageURL} close={() => setViewImageURL("")} />
          )}

          {openAddField && (
            <AddFieldComponent
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              submit={handleAddField}
              close={() => setOpenAddField(false)}
            />
          )}
        </section>
      </div>
    </section>
  );
};

export default EditProductAdmin;
