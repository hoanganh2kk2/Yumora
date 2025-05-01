import React from "react";
import { IoClose } from "react-icons/io5";

const ConfirmBox = ({ cancel, confirm, close }) => {
  return (
    <div className=" fixed top-0 right-0 bottom-0 left-0 z-50 flex items-center justify-center bg-neutral-800/70 p-4">
      <div className="w-full max-w-md rounded bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-semibold">Xóa vĩnh viễn</h1>
          <button onClick={close}>
            <IoClose size={25} />
          </button>
        </div>
        <p className="my-4">Bạn có chắc chắn xóa vĩnh viễn không?</p>
        <div className="ml-auto flex w-fit items-center gap-3">
          <button
            onClick={cancel}
            className="rounded border border-red-500 px-4 py-1 text-red-500 hover:bg-red-500 hover:text-white"
          >
            Hủy bỏ
          </button>
          <button
            onClick={confirm}
            className="rounded border border-green-600 px-4 py-1 text-green-600 hover:bg-green-600 hover:text-white"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBox;
