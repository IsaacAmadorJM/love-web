import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Shape} from "react-konva";
import Konva from "konva";


const PuzzleJigsaw = ({ handleGameFinish, imageUrl, rows, columns, openModal }) => {
  const [image, setImage] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [scale, setScale] = useState(1);
  const [snapPieces, setSnapPieces] = useState([]);
  const pieceRefs = useRef({}); // Guarda referencias a los nodos de las piezas

  useEffect(() => {
    const img = new window.Image();
    img.src = imageUrl;

    img.onload = () => {
      const isVertical = window.visualViewport.height > window.visualViewport.width;
      let newScale;
      
      if (isVertical) {
        // Orientación vertical: puzzle ocupa mitad superior
        const availableWidth = window.visualViewport.width * 0.9;
        const availableHeight = window.visualViewport.height * 0.45; // 45% para dar margen
        
        const scaleByWidth = availableWidth / img.width;
        const scaleByHeight = availableHeight / img.height;
        newScale = Math.min(scaleByWidth, scaleByHeight);
      } else {
        // Orientación horizontal: puzzle ocupa mitad izquierda
        const availableWidth = window.visualViewport.width * 0.45; // 45% para dar margen
        const availableHeight = window.visualViewport.height * 0.9;
        
        const scaleByWidth = availableWidth / img.width;
        const scaleByHeight = availableHeight / img.height;
        newScale = Math.min(scaleByWidth, scaleByHeight);
      }

      setScale(newScale);
      setImage(img);
      generatePuzzlePieces(img, newScale);
    };
    
  }, [imageUrl, rows, columns]);

  const song = new Audio("/song.mp3");
  useEffect(() => {
    const playSongOnFirstClick = () => {
      song.volume = 0.1;
      song.loop = true; 
      song.play();
      document.removeEventListener("click", playSongOnFirstClick);
    };

    document.addEventListener("click", playSongOnFirstClick);

    return () => {
      document.removeEventListener("click", playSongOnFirstClick);
    };
  }, []);

  const generatePuzzlePieces = (img, newScale) => {
    const pieceWidth = (img.width / columns) * newScale;
    const pieceHeight = (img.height / rows) * newScale;
    const isVertical = window.visualViewport.height > window.visualViewport.width;

    const newPieces = [];
    const newSnapPieces = [];

    let id = 0;
    let targetX;
    let targetY;
    
    if (isVertical) {
      // Vertical: centrar en mitad superior
      targetX = (window.visualViewport.width - img.width * newScale) / 2;
      targetY = (window.visualViewport.height * 0.5 - img.height * newScale) / 2;
    } else {
      // Horizontal: centrar en mitad izquierda
      targetX = (window.visualViewport.width * 0.5 - img.width * newScale) / 2;
      targetY = (window.visualViewport.height - img.height * newScale) / 2;
    }
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        newPieces.push({
          id: id.toString(),
          x: targetX + col * pieceWidth,
          y: targetY + row * pieceHeight,
          width: pieceWidth,
          height: pieceHeight,
          row,
          col,
          isDragging: false,
          isCorrectPlace: false,
        });
        newSnapPieces.push({
          id: id.toString(),
          x: targetX + col * pieceWidth,
          y: targetY + row * pieceHeight,
          width: pieceWidth,
          height: pieceHeight,
          row,
          col,
        });
        id++;
      }
    }
    setSnapPieces(newSnapPieces);
    setPieces(newPieces);
    setTimeout(() => scatterPieces(newPieces), 300);
  };

  const scatterPieces = (newPieces) => {
    const isVertical = window.visualViewport.height > window.visualViewport.width;
    
    newPieces.forEach((piece) => {
      const node = pieceRefs.current[piece.id];
      if (node) {
        let randomX;
        let randomY;
        
        if (isVertical) {
          // Vertical: dispersar en mitad inferior
          const scatterAreaWidth = window.visualViewport.width * 0.95;
          const scatterAreaHeight = window.visualViewport.height * 0.45;
          const scatterStartY = window.visualViewport.height * 0.52;
          
          randomX = (window.visualViewport.width - scatterAreaWidth) / 2 + 
                    Math.random() * (scatterAreaWidth - piece.width);
          randomY = scatterStartY + 
                    Math.random() * (scatterAreaHeight - piece.height);
        } else {
          // Horizontal: dispersar en mitad derecha
          const scatterAreaWidth = window.visualViewport.width * 0.45;
          const scatterAreaHeight = window.visualViewport.height * 0.95;
          const scatterStartX = window.visualViewport.width * 0.52;
          
          randomX = scatterStartX + 
                    Math.random() * (scatterAreaWidth - piece.width);
          randomY = (window.visualViewport.height - scatterAreaHeight) / 2 + 
                    Math.random() * (scatterAreaHeight - piece.height);
        }

        node.to({
          x: randomX,
          y: randomY,
          duration: 0.5,
        });
      }
    });
  };

  useEffect(() => {
    const isPuzzleComplete = pieces.every((piece) => piece.isCorrectPlace) && pieces.length > 0;
    if (isPuzzleComplete) {
      handleGameFinish(true);
      openModal(true);
    }
  }, [pieces]);

  const drawCustomPiece = (context, shape) => {
    const piece = shape.getAttr("piece");
    const { col, row, width, height } = piece;
    const knobSize = Math.min(width, height) / 3;

    context.beginPath();
    context.moveTo(0, 0);
    //top side
    if (row != 0) {
      context.lineTo(width * 0.4, 0);
      if ((row + col) % 2 === 0) {
        context.bezierCurveTo(
          width * 0.4,
          0,
          width * 0.2,
          knobSize * 0.9,
          width * 0.5,
          knobSize
        );
        context.bezierCurveTo(
          width * 0.5,
          knobSize,
          width * 0.8,
          knobSize * 0.99,
          width * 0.6,
          0
        );
      } else {
        context.bezierCurveTo(
          width * 0.4,
          0,
          width * 0.2,
          -knobSize * 0.9,
          width * 0.5,
          -knobSize
        );
        context.bezierCurveTo(
          width * 0.5,
          -knobSize,
          width * 0.8,
          -knobSize * 0.99,
          width * 0.6,
          0
        );
      }
    }
    context.lineTo(width, 0);

    //right side
    if (col != columns - 1) {
      context.lineTo(width, height * 0.4);
      if ((row + col) % 2 != 0) {
        context.bezierCurveTo(
          width,
          height * 0.4,
          width - knobSize * 0.9,
          height * 0.2,
          width - knobSize,
          height * 0.5
        );
        context.bezierCurveTo(
          width - knobSize,
          height * 0.5,
          width - knobSize,
          height * 0.8,
          width,
          height * 0.6
        );
      } else {
        context.bezierCurveTo(
          width,
          height * 0.4,
          width + knobSize * 0.9,
          height * 0.2,
          width + knobSize,
          height * 0.5
        );
        context.bezierCurveTo(
          width + knobSize,
          height * 0.5,
          width + knobSize,
          height * 0.8,
          width,
          height * 0.6
        );
      }
    }
    context.lineTo(width, height);

    //bottom side
    if (row != rows - 1) {
      context.lineTo(width * 0.6, height);
      if ((row + col) % 2 === 0) {
        context.bezierCurveTo(
          width * 0.6,
          height,
          width * 0.8,
          height - knobSize * 0.9,
          width * 0.5,
          height - knobSize
        );
        context.bezierCurveTo(
          width * 0.5,
          height - knobSize,
          width * 0.2,
          height - knobSize * 0.99,
          width * 0.4,
          height
        );
      } else {
        context.bezierCurveTo(
          width * 0.6,
          height,
          width * 0.8,
          height + knobSize * 0.9,
          width * 0.5,
          height + knobSize
        );
        context.bezierCurveTo(
          width * 0.5,
          height + knobSize,
          width * 0.2,
          height + knobSize * 0.99,
          width * 0.4,
          height
        );
      }
    }
    context.lineTo(0, height);

    //left side
    if (col != 0) {
      context.lineTo(0, height * 0.6);
      if ((row + col) % 2 != 0) {
        context.bezierCurveTo(
          0,
          height * 0.6,
          knobSize * 0.9,
          height * 0.8,
          knobSize,
          height * 0.5
        );
        context.bezierCurveTo(
          knobSize,
          height * 0.5,
          knobSize,
          height * 0.2,
          0,
          height * 0.4
        );
      } else {
        context.bezierCurveTo(
          0,
          height * 0.6,
          -knobSize * 0.9,
          height * 0.8,
          -knobSize,
          height * 0.5
        );
        context.bezierCurveTo(
          -knobSize,
          height * 0.5,
          -knobSize,
          height * 0.2,
          0,
          height * 0.4
        );
      }
    }
    context.lineTo(0, 0);

    context.closePath();
    context.fillStrokeShape(shape);
  };

  if (!image) return null;

  const handleDragStart = (e) => {
    const node = e.target;
    node.moveToTop();

    node.to({
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 0.01,
      easing: Konva.Easings.EaseOut,
    });

    e.target.getStage().container().style.cursor = "grabbing";

    const id = node.id();
    setPieces(pieces.map(p => ({
      ...p,
      isDragging: p.id === id,
    })));
  };

  const handleDragEnd = (e) => {
    const node = e.target;

    node.to({
      scaleX: 1,
      scaleY: 1,
      duration: 0.15,
      easing: Konva.Easings.EaseOut,
    });

    e.target.getStage().container().style.cursor = "grab";
    const piece = e.target;
    const isVertical = window.visualViewport.height > window.visualViewport.width;
    let tolerance = Math.max(pieces[0].width, pieces[0].height) * 0.18;
    
    if(isVertical){
      tolerance = tolerance * 1.8;
    }

    // Obtenemos la pieza correspondiente en snapPieces
    const snapPiece = snapPieces[e.target.id()];

    // Comprobamos si la pieza está en el rango de tolerancia
    if (
      snapPiece.x - tolerance < piece.x() &&
      snapPiece.x + tolerance > piece.x() &&
      snapPiece.y - tolerance < piece.y() &&
      snapPiece.y + tolerance > piece.y()
    ) {
      // Si está dentro del rango de tolerancia, actualizamos las coordenadas
      new Audio("/assets/pop1.mp3").play();
      e.target.getStage().container().style.cursor = 'default';
      e.target.moveToBottom();
      setPieces(
        pieces.map((p) =>
          p.id === piece.id()
            ? {
                ...p,
                x: snapPiece.x,
                y: snapPiece.y,
                isDragging: false,
                isCorrectPlace: true, // Marcamos como correcta
              }
            : p
        )
      );
    } else {
      // Si no se encuentra en el rango, simplemente se detiene el arrastre
      setPieces(
        pieces.map((p) =>
          p.id === piece.id() ? { ...p, isDragging: false } : p
        )
      );
    }
  };

 
  return (
    <div className="w-full h-[100dvh] flex justify-center items-center bg-[#e6b4bf]">
    
    <Stage width={window.visualViewport.width} height={window.visualViewport.height*0.999}       
    
    style={{
      backgroundImage: `url('fondo.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}
>
      <Layer>
        {snapPieces.map((piece) => (
          <Shape
            key={piece.id}
            id={piece.id}
            piece={piece}
            x={piece.x}
            y={piece.y}
            sceneFunc={drawCustomPiece}
            fill={"#ffe2f0"}
            stroke="#ca7e8e"
            strokeWidth={1}
          />
        ))}
      </Layer>
      <Layer>
        {pieces.map((piece) => (
          <Shape
            key={piece.id}
            id={piece.id}
            piece={piece}
            x={piece.isCorrectPlace ? piece.x : piece.x + 1}
            y={piece.isCorrectPlace ? piece.y : piece.y + 1}
            ref={(node) => (pieceRefs.current[piece.id] = node)}
            sceneFunc={drawCustomPiece}
            fillPatternImage={image}
            fillPatternScale={{
              x: scale,
              y: scale,
            }}
            fillPatternOffset={{
              x: (piece.col * image.width) / columns,
              y: (piece.row * image.height) / rows,
            }}
            draggable={piece.isCorrectPlace ? false : true}
            
            stroke="#000"
            strokeWidth={
              piece.isDragging ? 1.7 : piece.isCorrectPlace ? 0.5 : 1.4
            }
            
            scaleX={piece.isDragging ? 1.1 : 1}
            scaleY={piece.isDragging ? 1.1 : 1}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onMouseEnter={piece.isCorrectPlace ? (e) => e.target.getStage().container().style.cursor = 'default' : (e) => e.target.getStage().container().style.cursor = 'grab'}
            onMouseLeave={(e) =>  e.target.getStage().container().style.cursor = 'default'}
          />
        ))}
      </Layer>
    </Stage>
    
    </div>
  );
};

export default PuzzleJigsaw;