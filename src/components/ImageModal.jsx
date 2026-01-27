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
      <div className="bg-white rounded-lg p-6 shadow-lg text-center ">
        <h2 className="text-4xl font-rouge font-semibold mb-2">{title}</h2>
        <img
          src={imageUrl}
          alt="Imagen Modal"
          className="w-full h-80 object-contain rounded-md"
        />
        <p className="text-gray-600 mt-2 mb-4">{description}</p>
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleClose}
            className="bg-red-400 border-2 text-lg max-w-96 tracking-wider border-red-800 text-white px-4 py-2 rounded-md hover:bg-rose-500 transition"
          >
            Ver fuegos artificiales
          </button>
          <button
            onClick={handleDownload}
            className="flex flex-row items-center  max-w-96 text-gray-600 px-4 py-2 rounded-md hover:underline transition"
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
