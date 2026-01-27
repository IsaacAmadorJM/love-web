import { IoMdDownload } from "react-icons/io";

const ImageModal = ({ open, handleClose, imageUrl, title, description }) => {
  if (!open) return null;

  const handleDownload = async () => {
  try {
    const response = await fetch(imageUrl, { mode: "cors" });
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "i-love-u.jpg";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error descargando la imagen", err);
  }
};


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-2 shadow-lg flex flex-col gap-2 items-center max-w-dvw max-h-dvh h-96 w-96 ">
        <h2 className="text-3xl font-rouge font-semibold">{title}</h2>
        <img
          src={imageUrl}
          alt="Imagen Modal"
          className=" h-1/2 rounded-md "
        />
        <p className="text-gray-600 ">{description}</p>
        <div className="flex flex-col items-center ">
          <button
            onClick={handleClose}
            className="bg-red-400 border-2 text-lg max-w-96 tracking-wider border-red-800 text-white px-4 py-2 rounded-md hover:bg-rose-500 transition"
          >
            Ver fuegos artificiales
          </button>
          <button
            onClick={handleDownload}
            className="flex flex-row items-center max-w-96 text-gray-600 px-4 pt-2 rounded-md hover:underline transition"
          >
            <span className=" text-sm">Descargar Imagen</span>
            <IoMdDownload className="ml-2 mt-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
