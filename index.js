const http = require('http');
const mariadb = require('mariadb');
const fs = require('fs');
const path = require('path');

const pool = mariadb.createPool({
    // Usa variables de entorno para Render, o local como respaldo
    host: process.env.DB_HOST || '127.0.0.1', 
    port: process.env.DB_PORT || 3307,         
    user: process.env.DB_USER || 'root',      
    password: process.env.DB_PASSWORD || 'jose24558', 
    database: process.env.DB_NAME || 'test',  
    connectionLimit: 10,
    acquireTimeout: 20000 
});

const servidor = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    let conn;
    try {
        conn = await pool.getConnection();
        const filas = await conn.query("SELECT * FROM productos");
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
        <title>Panel de Productos</title>
        <style>
            body { font-family: sans-serif; background: #f4f7f6; padding: 40px; }
            .container { max-width: 800px; margin: auto; background: white; padding: 20px; border-radius: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 12px; background: #f8fafc; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            .price { color: #2ecc71; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📦 Panel de Productos</h1>
            <table>
                <thead><tr><th>ID</th><th>Producto</th><th>Precio</th><th>Stock</th></tr></thead>
                <tbody>${tableRows}</tbody>
            </table>
        </div>
    </body>
    </html>`;
}

const PORT = process.env.PORT || 3000;
servidor.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> SERVIDOR ACTIVO EN PUERTO ${PORT}`);
});