import React from "react";
import { IoClose } from "react-icons/io5";

const ViewImage = ({ url, close }) => {
  return (
    <div className="fixed top-0 right-0 bottom-0 left-0 z-50 flex items-center justify-center bg-neutral-900/70 p-4">
      <div className="max-h-[80vh] w-full max-w-md bg-white p-4">
        <button onClick={close} className="ml-auto block w-fit">
          <IoClose size={25} />
        </button>
        <img
          src={url}
          alt="full screen"
          className="h-full w-full object-scale-down"
        />
      </div>
    </div>
  );
};

export default ViewImage;
