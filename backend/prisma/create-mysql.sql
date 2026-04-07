
CREATE DATABASE IF NOT EXISTS `kefix` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kefix`;

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `telefone` varchar(255) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `rua` varchar(255) DEFAULT NULL,
  `numero` varchar(255) DEFAULT NULL,
  `bairro` varchar(255) DEFAULT NULL,
  `cidade` varchar(255) DEFAULT NULL,
  `cep` varchar(255) DEFAULT NULL,
  `tipo` varchar(255) NOT NULL DEFAULT 'cliente',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `icone` varchar(255) NOT NULL DEFAULT 'package',
  PRIMARY KEY (`id`),
  UNIQUE KEY `categorias_slug_key` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `produtos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `categoria_id` int NOT NULL,
  `nome` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `descricao` text NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `estoque` int NOT NULL DEFAULT 0,
  `imagem` varchar(255) NOT NULL DEFAULT 'sem-imagem.png',
  `destaque` int NOT NULL DEFAULT 0,
  `ativo` int NOT NULL DEFAULT 1,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `produtos_slug_key` (`slug`),
  KEY `produtos_categoria_id_idx` (`categoria_id`),
  CONSTRAINT `produtos_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pedidos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `nome_cliente` varchar(255) NOT NULL,
  `telefone` varchar(255) NOT NULL,
  `endereco` text NOT NULL,
  `rua` varchar(255) DEFAULT NULL,
  `numero` varchar(255) DEFAULT NULL,
  `bairro` varchar(255) DEFAULT NULL,
  `cidade` varchar(255) DEFAULT NULL,
  `cep` varchar(255) DEFAULT NULL,
  `forma_pagamento` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pendente',
  `total` decimal(10,2) NOT NULL,
  `observacoes` text DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pedidos_usuario_id_idx` (`usuario_id`),
  CONSTRAINT `pedidos_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `itens_pedido` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pedido_id` int NOT NULL,
  `produto_id` int NOT NULL,
  `quantidade` int NOT NULL,
  `preco_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `itens_pedido_pedido_id_idx` (`pedido_id`),
  KEY `itens_pedido_produto_id_idx` (`produto_id`),
  CONSTRAINT `itens_pedido_pedido_id_fkey` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `itens_pedido_produto_id_fkey` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Opcional: insere usuário admin inicial, caso queira testar.
INSERT IGNORE INTO `usuarios` (`nome`, `email`, `senha`, `tipo`, `criado_em`)
VALUES ('Admin KeFix', 'admin@kefix.com', '$2a$10$wNT/XBMhDUivuYhL.cnaE.OMHAlbELD.skjHETxYUotG0MHDf/Q1y', 'admin', NOW());
