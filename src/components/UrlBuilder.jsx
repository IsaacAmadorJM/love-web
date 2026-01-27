import { useState } from "react";
import PhotoFrame from "./PhotoFrame";
import { FiCopy } from "react-icons/fi";

const clamp = (v, min, max, def) => {
  if (Number.isNaN(v)) return def;
  if (v < min) return def;
  if (v > max) return max;
  return v;
};

export default function UrlBuilder() {
  const [x, setX] = useState(5);
  const [y, setY] = useState(7);
  const [imgUrl, setImgUrl] = useState(
    "https://a.storyblok.com/f/112937/568x379/b8d91ebdb6/image-2019-02-12.jpg/m/620x0/filters:quality(70)/",
  );
  console.log(imgUrl);
  const [text, setText] = useState(
    "No puedo imaginar un mundo en el que no estés tú",
  );
  const [url, setUrl] = useState("");

  const safeX = clamp(Number(x), 1, 50, 5);
  const safeY = clamp(Number(y), 1, 50, 7);
  const safeText = text.slice(0, 400);

  // const url = useMemo(() => {
  //   const params = new URLSearchParams({
  //     x: safeX,
  //     y: safeY,
  //     img: imgUrl,
  //     txt: safeText,
  //   });
  //   return `${window.location.origin}?${params.toString()}`;
  // }, [safeX, safeY, imgUrl, safeText]);

  const onGenerateUrl = () => {
    const params = new URLSearchParams({
      x: safeX,
      y: safeY,
      txt: safeText,
    });
    console.log(imgUrl);
    setUrl(`${window.location.origin}?${params.toString()}&img=${imgUrl}`);
  };

  const onCopy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
  };

  return (
    <div className="max-w-dvw h-dvh bg-red-200 flex justify-center text-lg gap-0 relative">
      {/* <div className="h-dvh w-full absolute flex justify-center sm:w-96 bg-black/20 sm:items-center">
      <label className="flex flex-col w-80 items-center gap-2"> Previsualización:
        
       <ImageGridPreview
       className=''
       imageUrl={imgUrl}
       rows={safeX}
       cols={safeY}
       maxW={250}
       maxH={250}
       />
       <span className="text-xs text-neutral-700 text-center">* Es solo un ejemplo para ver el tamaño de las piezas en comparación con el puzzle completo</span>
       </label>
      </div> */}
      <div className=" flex flex-col font-semibold tracking-wider items-center w-full text-black   h-dvh  p-4 gap-2">
        <div className="flex">
          <label className="flex flex-col w-80 items-center gap-2">
            Previsualización:
            <ImageGridPreview
              className=""
              imageUrl={imgUrl}
              rows={safeX}
              cols={safeY}
              maxW={250}
              maxH={250}
            />
            <span className="text-xs text-neutral-700 text-center">
              * Es solo un ejemplo para ver el tamaño de las piezas en
              comparación con el puzzle completo
            </span>
            <div className="flex gap-2">
              <label className="flex items-center">
                Filas:
                <input
                  type="number"
                  className="w-16 h-8 rounded-lg px-2 font-normal bg-red-100"
                  min={1}
                  onChange={(e) => setX(e.target.value)}
                  max={50}
                  value={x}
                  placeholder="Rows (1-50)"
                />
              </label>
              <label className="flex items-center ">
                Columnas:
                <input
                  type="number"
                  className="w-16 h-8 rounded-lg px-2 font-normal bg-red-100"
                  min={1}
                  max={50}
                  value={y}
                  onChange={(e) => setY(e.target.value)}
                  placeholder="Cols (1-50)"
                />
              </label>
            </div>
          </label>
        </div>

        <label className="flex flex-col ">
          Enlace de la imagen:
          <input
            type="url"
            value={imgUrl}
            onChange={(e) => setImgUrl(e.target.value)}
            className="min-w-[400px] sm:min-w-[600px] h-8 rounded-lg px-2 font-normal bg-red-100"
            placeholder="Image URL"
          />
        </label>
        <label className="flex flex-col ">
          Mensaje especial:
          <textarea
            maxLength={400}
            rows="3"
            className="min-w-[400px] sm:min-w-[600px]  h-auto  rounded-lg px-2 font-normal bg-red-100"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Mensaje (máx 400 caracteres)"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            onGenerateUrl();
          }}
          className="bg-green-600 mb-2 text-white tracking-widest px-8 py-2 sm:py-4 rounded-lg border-black border-2"
        >
          Generar Enlace
        </button>

        <p>URL generada:</p>
        <div className="relative min-w-[400px] sm:min-w-[600px]">
          <input
            type="url"
            value={url}
            className="w-full h-10 rounded-lg px-2 pr-10 font-normal bg-red-100"
            placeholder="enlace"
            onFocus={(e) => e.target.select()}
            readOnly
          />
          <button
            type="button"
            onClick={onCopy}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xl text-gray-700 hover:text-black"
            title="Copiar"
          >
            <FiCopy />
          </button>
        </div>
      </div>
      <div className="bg-black w-30 h-dvh">
        <PhotoFrame
          initialXDesktop="70%"
          initialYDesktop="10%"
          initialYMobile="5%"
          initialXMobile="70%"
          imageUrl={imgUrl}
          text={safeText}
        />
      </div>
    </div>
  );
}

import { useEffect } from "react";

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
