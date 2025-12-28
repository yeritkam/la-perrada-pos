import { Link } from "react-router-dom";

export default function MenuPage() {
  // ¡IMPORTANTE! Cambia estos nombres si tus fotos tienen otro nombre
  const menuPhotos = [
    "/menu-pagina-1.jpg",  // Tu primera foto
    "/menu-pagina-2.jpg"   // Tu segunda foto
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* HEADER */}
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">🍽️ Menú Completo</h1>
          <p className="text-gray-600 text-sm md:text-base">Nuestra deliciosa carta</p>
        </div>
        <Link 
          to="/" 
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all text-sm md:text-base"
        >
          ← Volver al POS
        </Link>
      </header>

      {/* GALERÍA */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-6 text-center">
          <p className="text-gray-700 mb-2">📱 <span className="font-semibold">Haz clic en cada foto para verla en grande</span></p>
          <p className="text-gray-600 text-sm">Tenemos {menuPhotos.length} páginas en nuestro menú</p>
        </div>

        {/* FOTOS EN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {menuPhotos.map((photo, index) => (
            <div key={index} className="bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300">
              {/* ENCABEZADO */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white text-gray-800 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <h2 className="text-lg md:text-xl font-bold">Página {index + 1}</h2>
                  </div>
                  <span className="text-yellow-300">📄</span>
                </div>
              </div>

              {/* FOTO */}
              <div className="p-2 md:p-4 bg-gray-100">
                <div className="relative overflow-hidden rounded-lg border-4 border-white shadow-inner">
                  <img 
                    src={photo} 
                    alt={`Menú página ${index + 1}`}
                    className="w-full h-auto object-contain cursor-zoom-in hover:scale-105 transition-transform duration-500"
                    onClick={() => window.open(photo, '_blank')}
                  />
                  <div className="absolute bottom-4 right-4">
                    <button
                      onClick={() => window.open(photo, '_blank')}
                      className="bg-black/70 text-white px-4 py-2 rounded-lg font-semibold hover:bg-black/90 transition-all backdrop-blur-sm flex items-center gap-2"
                    >
                      🔍 Ver en grande
                    </button>
                  </div>
                </div>
              </div>

              {/* PIE */}
              <div className="bg-gray-50 p-3 md:p-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>🖼️ Foto {index + 1} de {menuPhotos.length}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* INFO */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 md:p-6">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">¿Cómo usar?</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">• <span className="font-medium">Clic en foto</span> = ver en pantalla completa</li>
                <li className="flex items-center gap-2">• <span className="font-medium">Muestra a clientes</span> esta pantalla</li>
                <li className="flex items-center gap-2">• <span className="font-medium">En móvil</span> = una debajo de otra</li>
                <li className="flex items-center gap-2">• <span className="font-medium">En PC</span> = una al lado de la otra</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}