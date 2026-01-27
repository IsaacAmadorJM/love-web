import { useMemo, useState } from "react";
import PhotoFrame from "./PhotoFrame";
import { FiCopy, FiLink, FiUpload } from "react-icons/fi";

const clamp = (v, min, max, def) => {
  if (Number.isNaN(v)) return def;
  if (v < min) return def;
  if (v > max) return max;
  return v;
};

const tabs = [
  {
    title: "URL",
    value: "url",
    icon: FiLink,
  },
  {
    title: "Archivo",
    value: "file",
    icon: FiUpload,
  },
];

export default function UrlBuilder() {
  const [x, setX] = useState(5);
  const [y, setY] = useState(7);

  const [imgUrl, setImgUrl] = useState(
    "https://a.storyblok.com/f/112937/568x379/b8d91ebdb6/image-2019-02-12.jpg",
  );

  const [imageFile, setImageFile] = useState(null);
  const [text, setText] = useState(
    "No puedo imaginar un mundo en el que no estés tú",
  );
  const [url, setUrl] = useState("");

  const [mode, setMode] = useState("url");
  const [isUploading, setIsUploading] = useState(false);

  const safeX = clamp(Number(x), 1, 50, 5);
  const safeY = clamp(Number(y), 1, 50, 7);
  const safeText = text.slice(0, 400);

  const CLOUD_NAME = "dwxm3k3x1";
  const UPLOAD_PRESET = "mi_preset";

  // 👉 URL SOLO PARA PREVIEW (sin subir nada)
  const previewUrl = useMemo(() => {
    if(mode == 'url') return imgUrl;
    if (imageFile) return URL.createObjectURL(imageFile);
    return imgUrl;
  }, [imageFile, imgUrl, mode]);

  const uploadToCloudinary = async () => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData },
    );

    const data = await res.json();
    return data.secure_url;
  };

  const onGenerateUrl = async () => {
    if (isUploading) return;

    let finalImgUrl = imgUrl;

    if (mode === "file") {
      if (!imageFile) return alert("Selecciona una imagen");

      setIsUploading(true);
      const uploadedUrl = await uploadToCloudinary();
      setIsUploading(false);

      if (!uploadedUrl) return;

      setImgUrl(uploadedUrl);
      setImageFile(null); // limpia preview local
      finalImgUrl = uploadedUrl;
    }

    const params = new URLSearchParams({
      x: safeX,
      y: safeY,
      txt: safeText,
      img: finalImgUrl,
    });

    setUrl(`${window.location.origin}?${params.toString()}`);
  };

  const onCopy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
  };

  return (
    <div className="max-w-dvw h-dvh bg-red-200 flex justify-center text-lg relative">
      <div className="flex flex-col font-semibold items-center w-full h-dvh p-4 gap-3">
        {/* PREVIEW GRID */}
        <ImageGridPreview
          imageUrl={previewUrl}
          rows={safeX}
          cols={safeY}
          maxW={250}
          maxH={250}
        />
        <span className="text-xs text-neutral-600 text-center">
          * Es solo un ejemplo para ver el tamaño de las piezas en comparación
          con el puzzle completo
        </span>
        {/* Rows / Cols */}
        <div className="flex gap-2">
          <input
            type="number"
            className="w-16 h-8 rounded-lg px-2 bg-red-100"
            min={1}
            max={50}
            value={x}
            onChange={(e) => setX(e.target.value)}
          />
          <input
            type="number"
            className="w-16 h-8 rounded-lg px-2 bg-red-100"
            min={1}
            max={50}
            value={y}
            onChange={(e) => setY(e.target.value)}
          />
        </div>

        <Tabs tabs={tabs} onTabChange={setMode} />

        {/* IMAGE INPUT */}
        {mode === "url" ? (
          <input
            type="url"
            value={imgUrl}
            onChange={(e) => {
              setImgUrl(e.target.value);
              setImageFile(null);
            }}
            className="min-w-[400px] sm:min-w-[600px] h-8 rounded-lg px-2 bg-red-100"
          />
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="min-w-[400px] sm:min-w-[600px]"
          />
        )}

        {/* TEXT */}
        <textarea
          maxLength={400}
          rows={3}
          className="min-w-[400px] sm:min-w-[600px] rounded-lg px-2 bg-red-100"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* GENERATE */}
        <button
          onClick={onGenerateUrl}
          disabled={isUploading}
          className={`px-8 py-3 rounded-lg border-2 tracking-widest ${
            isUploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 text-white"
          }`}
        >
          {isUploading ? "Subiendo imagen..." : "Generar Enlace"}
        </button>

        {/* RESULT */}
        <div className="relative min-w-[400px] sm:min-w-[600px]">
          <input
            type="url"
            value={url}
            readOnly
            className="w-full h-10 rounded-lg px-2 pr-10 bg-red-100"
            onFocus={(e) => e.target.select()}
          />
          <button
            onClick={onCopy}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <FiCopy />
          </button>
        </div>
      </div>

      {/* PHOTO FRAME PREVIEW */}
      <PhotoFrame
        initialXDesktop="75%"
        initialYDesktop="10%"
        initialYMobile="5%"
        initialXMobile="70%"
        imageUrl={previewUrl}
        text={safeText}
      />
    </div>
  );
}

import { useEffect } from "react";
import { Tabs } from "./ImageTabs";

function useImageSize(src) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.onload = () => setSize({ w: img.width, h: img.height });
    img.src = src;
  }, [src]);

  return size;
}

function ImageGridPreview({
  className = "",
  imageUrl,
  rows,
  cols,
  maxW = 200,
  maxH = 200,
}) {
  const { w, h } = useImageSize(imageUrl);
  if (!w || !h) return null;

  // Escalado para encajar
  const scale = Math.min(maxW / w, maxH / h, 1);
  const width = w * scale;
  const height = h * scale;

  return (
    <div
      className={`relative border border-black bg-center bg-cover ${className}`}
      style={{
        width,
        height,
        backgroundImage: `url("${imageUrl}")`,
      }}
    >
      {/* Líneas verticales */}
      {Array.from({ length: cols - 1 }).map((_, i) => (
        <div
          key={`v-${i}`}
          className="absolute top-0 bottom-0 bg-black"
          style={{
            width: 1,
            left: `${((i + 1) / cols) * 100}%`,
          }}
        />
      ))}

      {/* Líneas horizontales */}
      {Array.from({ length: rows - 1 }).map((_, i) => (
        <div
          key={`h-${i}`}
          className="absolute left-0 right-0 bg-black"
          style={{
            height: 1,
            top: `${((i + 1) / rows) * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
