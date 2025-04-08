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
import { useEffect } from "react";
import successAlert from "../utils/SuccessAlert";

const UploadProduct = () => {
  const [data, setData] = useState({
    name: "",
    image: [],
    category: [],
    subCategory: [],
    unit: "",
    stock: "",
    price: "",
    discount: "",
    description: "",
    more_details: {},
  });
  const [imageLoading, setImageLoading] = useState(false);
  const [ViewImageURL, setViewImageURL] = useState("");
  const allCategory = useSelector((state) => state.product.allCategory);
  const [selectCategory, setSelectCategory] = useState("");
  const [selectSubCategory, setSelectSubCategory] = useState("");
  const allSubCategory = useSelector((state) => state.product.allSubCategory);

  const [openAddField, setOpenAddField] = useState(false);
  const [fieldName, setFieldName] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

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
    setImageLoading(false);
  };

  const handleDeleteImage = async (index) => {
    data.image.splice(index, 1);
    setData((pre) => {
      return {
        ...pre,
      };
    });
  };

  const handleRemoveCategory = async (index) => {
    data.category.splice(index, 1);
    setData((pre) => {
      return {
        ...pre,
      };
    });
  };

  const handleRemoveSubCategory = async (index) => {
    data.subCategory.splice(index, 1);
    setData((pre) => {
      return {
        ...pre,
      };
    });
  };

  const handleAddField = () => {
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

    try {
      const response = await Axios({
        ...SummaryApi.createProduct,
        data: data,
      });
      const { data: responseData } = response;

      if (responseData.success) {
        successAlert(responseData.message);
        setData({
          name: "",
          image: [],
          category: [],
          subCategory: [],
          unit: "",
          stock: "",
          price: "",
          discount: "",
          description: "",
          more_details: {},
        });
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  useEffect(()=>{
    successAlert("Upload successfully")
  },[])
  return (
    <section>
      <div className="flex items-center justify-between bg-white p-2 shadow-md">
        <h2 className="font-semibold">Upload Product</h2>
      </div>
      <div className="gird p-3">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <label htmlFor="name" className="font-medium">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter product name"
              name="name"
              value={data.name}
              onChange={handleChange}
              required
              className="focus-within:border-primary-200 rounded border border-slate-200 bg-blue-50 p-2 outline-none"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="description" className="font-medium">
              Description
            </label>
            <textarea
              id="description"
              type="text"
              placeholder="Enter product description"
              name="description"
              value={data.description}
              onChange={handleChange}
              required
              multiple
              rows={3}
              className="focus-within:border-primary-200 resize-none rounded border border-slate-200 bg-blue-50 p-2 outline-none"
            />
          </div>
          <div>
            <p className="font-medium">Image</p>
            <div>
              <label
                htmlFor="productImage"
                className="flex h-24 items-center justify-center rounded border border-slate-200 bg-blue-50"
              >
                <div className="flex cursor-pointer flex-col items-center justify-center text-center">
                  {imageLoading ? (
                    <Loading />
                  ) : (
                    <>
                      {" "}
                      <FaCloudUploadAlt size={35} />
                      <p>Upload Image</p>
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
              <div>
                {/* display upload image */}
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
          </div>
          <div className="grid gap-1">
            <label className="font-medium">Category</label>
            <div>
              <select
                className="w-full rounded border border-slate-200 bg-blue-50 p-2"
                value={selectCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  const category = allCategory.find((el) => el._id === value);

                  setData((pre) => {
                    return {
                      ...pre,
                      category: [...pre.category, category],
                    };
                  });
                  setSelectCategory("");
                }}
              >
                <option value={""}>Select Category</option>
                {allCategory.map((c, index) => {
                  return <option value={c?._id}>{c.name}</option>;
                })}
              </select>
              <div className="flex flex-wrap gap-3">
                {data.category.map((c, index) => {
                  return (
                    <div
                      key={c._id + index + "productsection"}
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
            <label className="font-medium">Sub Category</label>
            <div>
              <select
                className="w-full rounded border border-slate-200 bg-blue-50 p-2"
                value={selectSubCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  const subCategory = allSubCategory.find(
                    (el) => el._id === value,
                  );

                  setData((pre) => {
                    return {
                      ...pre,
                      subCategory: [...pre.subCategory, subCategory],
                    };
                  });
                  setSelectSubCategory("");
                }}
              >
                <option value={""} className="text-neutral-600">
                  Select Sub Category
                </option>
                {allSubCategory.map((c, index) => {
                  return <option value={c?._id}>{c.name}</option>;
                })}
              </select>
              <div className="flex flex-wrap gap-3">
                {data.subCategory.map((c, index) => {
                  return (
                    <div
                      key={c._id + index + "productsection"}
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
              Unit
            </label>
            <input
              id="unit"
              type="text"
              placeholder="Enter product unit"
              name="unit"
              value={data.unit}
              onChange={handleChange}
              required
              className="focus-within:border-primary-200 rounded border border-slate-200 bg-blue-50 p-2 outline-none"
            />
          </div>
          <div className="grid gap-1">
            <label className="font-medium" htmlFor="stock">
              Number of Stock
            </label>
            <input
              id="stock"
              type="number"
              placeholder="Enter product stock"
              name="stock"
              value={data.stock}
              onChange={handleChange}
              required
              className="focus-within:border-primary-200 rounded border border-slate-200 bg-blue-50 p-2 outline-none"
            />
          </div>
          <div className="grid gap-1">
            <label className="font-medium" htmlFor="price">
              Price
            </label>
            <input
              id="price"
              type="number"
              placeholder="Enter product price"
              name="price"
              value={data.price}
              onChange={handleChange}
              required
              className="focus-within:border-primary-200 rounded border border-slate-200 bg-blue-50 p-2 outline-none"
            />
          </div>
          <div className="grid gap-1">
            <label className="font-medium" htmlFor="discount">
              Discount
            </label>
            <input
              id="discount"
              type="number"
              placeholder="Enter product discount"
              name="discount"
              value={data.discount}
              onChange={handleChange}
              required
              className="focus-within:border-primary-200 rounded border border-slate-200 bg-blue-50 p-2 outline-none"
            />
          </div>

          {/* add more field */}

          {Object?.keys(data?.more_details).map((k, index) => {
            return (
              <div className="grid gap-1">
                <label htmlFor={k}>{k}</label>
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
                  required
                  className="focus-within:border-primary-200 rounded border border-slate-200 bg-blue-50 p-2 outline-none"
                />
              </div>
            );
          })}

          <div
            onClick={() => setOpenAddField(true)}
            className="hover:bg-primary-200 border-primary-200 w-32 cursor-pointer rounded border bg-white px-3 py-1 text-center font-semibold hover:text-neutral-900"
          >
            Add Fields
          </div>

          <button className="bg-primary-100 hover:bg-primary-200 rounded py-2 font-semibold">
            Submit
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
  );
};

export default UploadProduct;
