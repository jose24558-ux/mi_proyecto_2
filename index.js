const http = require('http');
const mariadb = require('mariadb');
const fs = require('fs');
const path = require('path');

const pool = mariadb.createPool({
    host: '127.0.0.1', 
    port: 3307,        
    user: 'root',      
    password: 'jose24558', 
    database: 'test',  
    connectionLimit: 10,
    acquireTimeout: 20000 
});

const servidor = http.createServer(async (req, res) => {
    // ESTAS LÍNEAS SON LAS QUE DAN EL PERMISO:
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    // ... resto del código
    let conn;
    try {
        conn = await pool.getConnection();
        const filas = await conn.query("SELECT * FROM productos");

        // Verificamos si el cliente prefiere HTML (Navegador) o JSON (Postman/Apps)
        const acceptHeader = req.headers['accept'] || '';
        
        if (acceptHeader.includes('text/html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(generarPaginaHTML(filas));
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: "OK", total: filas.length, datos: filas }));
        }

    } catch (err) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: "Error", detalle: err.message }));
    } finally {
        if (conn) conn.release();
    }
});

// Función para inyectar un diseño "Premium"
function generarPaginaHTML(datos) {
    const tableRows = datos.map(p => `
        <tr>
            <td>${p.id || '-'}</td>
            <td><strong>${p.nombre || 'Sin nombre'}</strong></td>
            <td><span class="price">$${p.precio || '0.00'}</span></td>
            <td>${p.stock || 0} u.</td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Inventario de Productos</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Inter', sans-serif; background: #f4f7f6; color: #333; margin: 0; padding: 40px; }
            .container { max-width: 900px; margin: auto; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
            h1 { margin: 0; color: #2d3748; font-size: 1.5rem; }
            .badge { background: #e6fffa; color: #2c7a7b; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { text-align: left; background: #f8fafc; color: #64748b; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; padding: 12px; }
            td { padding: 15px 12px; border-bottom: 1px solid #f1f5f9; }
            tr:hover { background: #f1f5f9; transition: 0.2s; }
            .price { color: #2ecc71; font-weight: 600; }
            .footer { margin-top: 20px; font-size: 0.8rem; color: #94a3b8; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>📦 Panel de Productos</h1>
                <div class="badge">${datos.length} Items Encontrados</div>
            </header>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Stock</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            <div class="footer">Dashboard generado automáticamente por MariaDB & Node.js</div>
        </div>
    </body>
    </html>`;
}

// Render nos da el puerto en process.env.PORT
const PORT = process.env.PORT || 3000;

servidor.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> SERVIDOR ACTIVO EN PUERTO ${PORT}`);
});
