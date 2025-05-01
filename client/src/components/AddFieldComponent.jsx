import React from "react";
import { IoClose } from "react-icons/io5";

const AddFieldComponent = ({ close, value, onChange, submit }) => {
  return (
    <section className="fixed top-0 right-0 bottom-0 left-0 z-50 flex items-center justify-center bg-neutral-900/70 p-4">
      <div className="w-full max-w-md rounded bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-semibold">Thêm</h1>
          <button onClick={close}>
            <IoClose size={25} />
          </button>
        </div>
        <input
          className="focus-within:border-primary-100 my-3 w-full rounded border border-slate-200 bg-blue-50 p-2 outline-none"
          placeholder="Enter field name"
          value={value}
          onChange={onChange}
        />
        <button
          onClick={submit}
          className="bg-primary-200 hover:bg-primary-100 mx-auto block w-fit rounded px-4 py-2"
        >
          Thêm
        </button>
      </div>
    </section>
  );
};

export default AddFieldComponent;
