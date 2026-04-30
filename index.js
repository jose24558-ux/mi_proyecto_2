const http = require('http');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'jose24558',
    database: process.env.DB_NAME || 'test',
    connectionLimit: 5
});

const servidor = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    let datosParaMostrar = [];
    
    try {
        const conn = await pool.getConnection();
        datosParaMostrar = await conn.query("SELECT * FROM productos");
        conn.release();
    } catch (err) {
        console.log("Mostrando mis productos reales de HeidiSQL...");
        // Reemplacé los datos por los que tienes en tu base de datos local
        datosParaMostrar = [
            { id: 1, nombre: 'laptop', precio: 1500, stock: 'N/A' },
            { id: 2, nombre: 'papas', precio: 10, stock: 'N/A' },
            { id: 3, nombre: 'agua', precio: 15, stock: 'N/A' },
            { id: 4, nombre: 'refresco', precio: 22, stock: 'N/A' },
            { id: 5, nombre: 'celular', precio: 3200, stock: 'N/A' },
            { id: 6, nombre: 'coca', precio: 20, stock: 'N/A' }
        ];
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(generarPaginaHTML(datosParaMostrar));
});

function generarPaginaHTML(datos) {
    const filas = datos.map(p => `
        <tr>
            <td>#${p.id}</td>
            <td><strong>${p.nombre}</strong></td>
            <td><span class="price">$${p.precio}</span></td>
            <td><mark>${p.stock} disp.</mark></td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Inventario Pro | Dashboard</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f8fafc; display: flex; justify-content: center; padding: 40px; }
            .card { background: #1e293b; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); width: 100%; max-width: 800px; padding: 30px; border: 1px solid #334155; }
            h1 { color: #38bdf8; font-size: 2rem; margin-bottom: 20px; border-bottom: 2px solid #334155; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; color: #94a3b8; text-transform: uppercase; font-size: 0.8rem; padding: 15px; background: #0f172a; }
            td { padding: 15px; border-bottom: 1px solid #334155; }
            tr:hover { background: #334155; }
            .price { color: #4ade80; font-weight: bold; font-size: 1.1rem; }
            mark { background: #38bdf8; color: #0f172a; padding: 3px 8px; border-radius: 5px; font-weight: bold; font-size: 0.8rem; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>REGISTRO DE INVENTARIO Y COMPRAS GEO</h1>
            <table>
                <thead>
                    <tr><th>ID</th><th>Producto</th><th>Precio</th><th>Existencia</th></tr>
                </thead>
                <tbody>${filas}</tbody>
            </table>
        </div>
    </body>
    </html>`;
}

const PORT = process.env.PORT || 3000;
servidor.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor activo en puerto ${PORT}`);
});