import React from "react";
import banner from "../assets/newpanner.png";
import bannerMobile from "../assets/newpannermobile.png";
import { useSelector } from "react-redux";
import { validURLConvert } from "../utils/validURLConvert";
import { Link, useNavigate } from "react-router-dom";
import CategoryWiseProductDisplay from "../components/CategoryWiseProductDisplay";

const Home = () => {
  const loadingCategory = useSelector((state) => state.product.loadingCategory);
  const categoryData = useSelector((state) => state.product.allCategory);
  const subCategoryData = useSelector((state) => state.product.allSubCategory);
  const navigate = useNavigate();

  const handleRedirectProductListPage = (id, cat) => {
    console.log(id, cat);
    const subcategory = subCategoryData.find((sub) => {
      const filterData = sub.category.some((c) => {
        return c._id == id;
      });

      return filterData ? true : null;
    });
    const url = `/${validURLConvert(cat)}-${id}/${validURLConvert(subcategory.name)}-${subcategory._id}`;

    navigate(url);
    console.log(url);
  };
  return (
    <section className="bg-white">
      <div className="container mx-auto">
        <div
          className={`my-2 h-full min-h-48 ${!banner && "animate-pulse"} w-full rounded bg-blue-100`}
        >
          <img
            src={banner}
            className="hidden h-full w-full lg:block"
            alt="banner"
          />
          <img
            src={bannerMobile}
            className="h-full w-full lg:hidden"
            alt="banner"
          />
        </div>
      </div>

      <div className="container mx-auto my-2 grid grid-cols-5 gap-2 px-4 md:grid-cols-8 lg:grid-cols-10">
        {loadingCategory
          ? new Array(12).fill(null).map((c, index) => {
              return (
                <div
                  key={index + "loadingcategory"}
                  className="grid min-h-36 animate-pulse gap-2 rounded bg-white p-4 shadow"
                >
                  <div className="min-h-24 rounded bg-blue-100"></div>
                  <div className="h-8 rounded bg-blue-100"></div>
                </div>
              );
            })
          : categoryData.map((cat, index) => {
              return (
                <div
                  key={cat._id + "displayCategory"}
                  className="h-full w-full"
                  onClick={() =>
                    handleRedirectProductListPage(cat._id, cat.name)
                  }
                >
                  <div>
                    <img
                      src={cat.image}
                      className="h-full w-full object-scale-down"
                    />
                  </div>
                </div>
              );
            })}
      </div>

      {/* display category product */}
      {categoryData.map((c, index) => {
        return (
          <CategoryWiseProductDisplay
            key={c?._id + "CategoryWiseProduct"}
            id={c?._id}
            name={c?.name}
          />
        );
      })}
    </section>
  );
};

export default Home;
