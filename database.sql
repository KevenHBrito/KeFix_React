-- ============================================
-- KeFix Distribuidora - Banco de Dados MySQL
-- ============================================

CREATE DATABASE IF NOT EXISTS kefix_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kefix_db;

-- Tabela de categorias
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icone VARCHAR(50) DEFAULT 'box',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    endereco TEXT,
    tipo ENUM('cliente', 'admin') DEFAULT 'cliente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    estoque INT DEFAULT 0,
    imagem VARCHAR(255) DEFAULT 'sem-imagem.png',
    destaque TINYINT(1) DEFAULT 0,
    ativo TINYINT(1) DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Tabela de pedidos
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    nome_cliente VARCHAR(150) NOT NULL,
    telefone VARCHAR(20),
    endereco TEXT NOT NULL,
    forma_pagamento ENUM('pix', 'cartao', 'dinheiro') NOT NULL,
    status ENUM('pendente', 'confirmado', 'enviado', 'entregue', 'cancelado') DEFAULT 'pendente',
    total DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Tabela de itens do pedido
CREATE TABLE itens_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

-- ============================================
-- Dados iniciais
-- ============================================

-- Categorias
INSERT INTO categorias (nome, slug, icone) VALUES
('Tela', 'tela', 'monitor'),
('Bateria', 'bateria', 'battery-charging'),
('Conector de Carga', 'conector-carga', 'zap'),
('Alto-falante', 'alto-falante', 'volume-2'),
('Microfone', 'microfone', 'mic'),
('Tampa Traseira', 'tampa-traseira', 'smartphone'),
('Carcaça', 'carcaca', 'layers'),
('Câmera', 'camera', 'camera');

-- Admin padrão (senha: admin123)
INSERT INTO usuarios (nome, email, senha, tipo) VALUES
('Administrador', 'admin@kefix.com.br', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Produtos de exemplo
INSERT INTO produtos (categoria_id, nome, descricao, preco, estoque, destaque) VALUES
(1, 'Tela iPhone 11 Original', 'Display LCD com touch original, sem manchas, 100% funcional. Compatível com iPhone 11.', 189.90, 15, 1),
(1, 'Tela Samsung A32 AMOLED', 'Tela AMOLED com digitalizador, cores vivas e resolução Full HD+.', 149.90, 20, 1),
(2, 'Bateria iPhone 12 Original', 'Bateria com capacidade original 2815mAh, ciclo novo, duração garantida.', 89.90, 30, 1),
(2, 'Bateria Samsung S21', 'Bateria de alta capacidade 4000mAh, compatível com Samsung Galaxy S21.', 79.90, 25, 0),
(3, 'Conector USB-C Samsung Universal', 'Conector de carga USB-C compatível com a maioria dos modelos Samsung.', 29.90, 50, 1),
(4, 'Alto-falante iPhone X/XS', 'Módulo de alto-falante original, som cristalino sem distorção.', 45.90, 18, 0),
(8, 'Câmera Traseira iPhone 13', 'Módulo de câmera traseira 12MP, substituta original.', 220.00, 10, 1),
(6, 'Tampa Traseira Xiaomi Redmi Note 11', 'Tampa traseira de vidro, encaixe perfeito, cor preto original.', 39.90, 35, 0);
