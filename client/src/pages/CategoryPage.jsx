import React, { useState } from "react";
import UploadCategoryModel from "../components/UploadCategoryModel";

const CategoryPage = () => {
  const [openUploadCategory, setOpenUploadCategory] = useState(false);

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

        {openUploadCategory && (
          <UploadCategoryModel close={() => setOpenUploadCategory(false)} />
        )}
      </section>
    </div>
  );
};

export default CategoryPage;
