import { useState, useEffect } from "react";
import "./index.css";

export default function App() {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [color, setColor] = useState("#000000");
  const [mode, setMode] = useState("paint");
  const [grid, setGrid] = useState([]);
  const [isGridCreated, setIsGridCreated] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const cellSize = 15;
  const [pincelActivo, setPincelActivo] = useState(true);


  // Cargar cuadrícula desde localStorage al iniciar
  useEffect(() => {
    const savedGrid = localStorage.getItem("grid");
    const savedWidth = localStorage.getItem("width");
    const savedHeight = localStorage.getItem("height");
    const savedColor = localStorage.getItem("color");
    const savedMode = localStorage.getItem("mode");

    if (savedGrid && savedWidth && savedHeight) {
      // Se restauran los valores de la cuadrícula
      const parsedGrid = JSON.parse(savedGrid);
      const parsedWidth = Number(savedWidth);
      const parsedHeight = Number(savedHeight);

      setWidth(parsedWidth);
      setHeight(parsedHeight);
      setGrid(parsedGrid);

      if (savedColor) setColor(savedColor);
      if (savedMode) setMode(savedMode);
    }
  }, []);

  // Guardar cuadrícula, ancho, alto, color y modo en localStorage
  useEffect(() => {
    if (grid.length > 0) localStorage.setItem("grid", JSON.stringify(grid));
  }, [grid]);

  useEffect(() => {
    if (width > 0) localStorage.setItem("width", String(width));
  }, [width]);

  useEffect(() => {
    if (height > 0) localStorage.setItem("height", String(height));
  }, [height]);

  useEffect(() => {
    localStorage.setItem("color", color);
  }, [color]);

  useEffect(() => {
    localStorage.setItem("mode", mode);
  }, [mode]);

  // Crea una nueva cuadrícula
  function handleCreateGrid() {
    const newGrid = [];
    for (let i = 0; i < height; i++) {
      const row = [];
      for (let j = 0; j < width; j++) {
        // Matriz bidimensional de objetos con color y id
        row.push({ color: "transparent", id: `${i}-${j}` });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setIsGridCreated(true);
  }

  // Exporta cuadrícula como imagen png
  function handleDownload() {
    const canvas = document.createElement("canvas");
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;
    const ctx = canvas.getContext("2d");

    grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        ctx.fillStyle = cell.color;
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      });
    });

    canvas.toBlob((blob) => {
      const url = document.createElement("a");
      url.download = "drawing.png";
      url.href = URL.createObjectURL(blob);
      url.click();
      URL.revokeObjectURL(url.href);
    });
  }

  // Borra la cuadrícula y restablece el estado, reactiva botón de crear cuadrícula
  function handleClearGrid() {
    setGrid([]);
    setIsGridCreated(false);
    setWidth(0);
    setHeight(0);
    localStorage.removeItem("grid");
    localStorage.removeItem("width");
    localStorage.removeItem("height");
  }

  // Eventos de interacción del usuario
  function handleMouseDown(id, colorAtCell) {
    if (mode === "picker") {
      setColor(colorAtCell || "#000000");
      setMode("paint");
    } else {
      setIsDrawing(true);
      paintCell(id);
    }
  }
  function handleMouseUp() {
    setIsDrawing(false);
  }

  function handleMouseMove(id) {
    if (isDrawing) {
      paintCell(id);
    }
  }

  // Actualiza el color de la celda
  function paintCell(id) {
    const newGrid = grid.map((row) =>
      row.map((cell) =>
        cell.id === id
          ? { ...cell, color: mode === "paint" ? color : "transparent" }
          : cell
      )
    );
    setGrid(newGrid);
  }

  return (
    <div className="App">
      {/* Panel Izquierdo: Interfaz de usuario */}
      <div className="sidebar">
        <p className="credits">
          Hecho por <a href="https://albahernandez.dev/">Alba Hernández</a>
        </p>
        <h1 className="title">Pixel art</h1>
        <p className="instructions">
          <strong>1.</strong> Crea tu cuadrícula con un máximo de 40 filas y 40
          columnas.
          <br />
          <strong>2.</strong> Usa el modo Pintar, Borrar o Cuentagotas (🎨).
          <br />
          <strong>3.</strong> Puedes descargar tu dibujo.
        </p>

        <div className="controls">
          <div className="input-row">
            <label>
              Columnas:
              <input
                type="number"
                min="1"
                max="40"
                value={width}
                onChange={(e) => setWidth(Math.min(40, Number(e.target.value)))}
              />
            </label>
            <label>
              Filas:
              <input
                type="number"
                min="1"
                max="40"
                value={height}
                onChange={(e) =>
                  setHeight(Math.min(40, Number(e.target.value)))
                }
              />
            </label>

            {/* Solo se puede crear una vez */}
            <button
              className="btn create"
              onClick={handleCreateGrid}
              disabled={isGridCreated}
            >
              CREAR
            </button>
          </div>

          <label>
            Color:
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </label>

          <div className="btn-control">
            <button
              className={`btn ${mode === "paint" ? "active" : ""}`}
              onClick={() => setMode("paint")}
            >
              Pintar
            </button>
            <button
              className={`btn ${mode === "erase" ? "active" : ""}`}
              onClick={() => setMode("erase")}
            >
              Borrar
            </button>

            <button
              className={`btn ${pincelActivo ? "active" : ""}`}
              onClick={() => setPincelActivo(!pincelActivo)}
           >
            {pincelActivo ? "Desactivar pincel (Visual)" : "Activar pincel (visual)"}
           </button>

            <button
              className={`btn ${mode === "picker" ? "active" : ""}`}
              onClick={() => setMode("picker")}
            >
              🎨
            </button>

            <div className="delete-donwload">
              <button className="btn delete" onClick={handleClearGrid}>
                Borrar cuadrícula
              </button>
              <button className="btn" onClick={handleDownload}>
                Descargar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho: Render de la cuadrícula */}
      <div
        className={`grid ${pincelActivo ? "pincel-activo" : ""}`}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
          gap: "1px",
          marginTop: "10px",
        }}
        onMouseUp={handleMouseUp}
      >
        {grid.map((row) =>
          row.map((cell) => (
            <div
              key={cell.id}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: cell.color,
                border: "1px solid #000",
              }}
              onMouseDown={() => handleMouseDown(cell.id, cell.color)}
              onMouseMove={() => handleMouseMove(cell.id)}
              onTouchStart={() => handleMouseDown(cell.id, cell.color)}
              onTouchMove={() => handleMouseMove(cell.id)}
            ></div>
          ))
        )}
      </div>
    </div>
  );
}
