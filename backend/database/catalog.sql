SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS produto_model (
  id BINARY(16) NOT NULL,
  nome VARCHAR(255),
  descricao TEXT,
  slug VARCHAR(255),
  category_id VARCHAR(255),
  descricao_breve VARCHAR(255),
  preco DOUBLE,
  preco_original DOUBLE,
  rating DOUBLE,
  contagem_reviews INT,
  estoque INT,
  imagem_principal VARCHAR(255),
  featured BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS produto_model_highlights (
  produto_model_id BINARY(16) NOT NULL,
  highlights VARCHAR(255),
  CONSTRAINT fk_highlights_produto FOREIGN KEY (produto_model_id) REFERENCES produto_model(id)
);

CREATE TABLE IF NOT EXISTS imagem_model (
  imagem_id BINARY(16) NOT NULL,
  imagem_url VARCHAR(255),
  produto_id BINARY(16),
  PRIMARY KEY (imagem_id),
  CONSTRAINT fk_imagem_produto FOREIGN KEY (produto_id) REFERENCES produto_model(id)
);

CREATE TABLE IF NOT EXISTS variante_model (
  id CHAR(36) NOT NULL,
  label VARCHAR(255),
  value VARCHAR(255),
  available BOOLEAN,
  produto_id BINARY(16),
  PRIMARY KEY (id),
  CONSTRAINT fk_variante_produto FOREIGN KEY (produto_id) REFERENCES produto_model(id)
);

CREATE TABLE IF NOT EXISTS especificacao_model (
  id CHAR(36) NOT NULL,
  label VARCHAR(255),
  value VARCHAR(255),
  produto_id BINARY(16),
  PRIMARY KEY (id),
  CONSTRAINT fk_especificacao_produto FOREIGN KEY (produto_id) REFERENCES produto_model(id)
);

CREATE TABLE IF NOT EXISTS categoria_model (
  id VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  descricao TEXT,
  foto_url VARCHAR(255),
  PRIMARY KEY (id)
);

INSERT INTO categoria_model (id, nome, slug, descricao, foto_url) VALUES
  ('tech', 'Tecnologia', 'tech', 'Produtos de tecnologia', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80'),
  ('home', 'Casa', 'home', 'Produtos para casa', 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=80'),
  ('accessories', 'Acessórios', 'accessories', 'Acessórios para o dia a dia', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80');

INSERT INTO produto_model (
  id,
  nome,
  descricao,
  slug,
  category_id,
  descricao_breve,
  preco,
  preco_original,
  rating,
  contagem_reviews,
  estoque,
  imagem_principal,
  featured
) VALUES
  (
    UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01'),
    'Fones Wave Pro',
    'O Wave Pro foi feito para quem quer se concentrar no que importa. O cancelamento ativo de ruído reduz distrações, enquanto os drivers de alta definição entregam graves equilibrados e vozes nítidas. Com conexão Bluetooth estável e controles intuitivos, ele acompanha sua rotina no trabalho, nos estudos e no caminho para casa.',
    'fones-wave-pro',
    'tech',
    'Fones sem fio com cancelamento de ruído e até 30 horas de bateria.',
    349.90,
    429.90,
    4.8,
    124,
    18,
    '/api/imagens/fones-wave-pro-cover.jpg',
    TRUE
  ),
  (
    UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d02'),
    'Luminária Orbit',
    'A Luminária Orbit combina uma base compacta com luz LED regulável para iluminar sua mesa com conforto. Ajuste a intensidade e o ângulo conforme a tarefa, criando um ambiente mais agradável para leitura, trabalho ou estudo.',
    'luminaria-orbit',
    'home',
    'Luz LED ajustável para deixar sua mesa mais confortável e organizada.',
    189.90,
    NULL,
    4.6,
    67,
    9,
    '/api/imagens/luminaria-orbit-cover.jpg',
    TRUE
  ),
  (
    UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d03'),
    'Mochila Urban',
    'A Mochila Urban oferece espaço organizado e construção resistente para acompanhar a rotina. O compartimento interno acolchoado protege seus itens e os bolsos de acesso rápido mantêm o essencial sempre por perto.',
    'mochila-urban',
    'accessories',
    'Mochila resistente para levar o essencial durante a rotina.',
    259.90,
    NULL,
    4.9,
    89,
    0,
    '/api/imagens/mochila-urban-cover.jpg',
    FALSE
  ),
  (
    UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04'),
    'Garrafa Terra',
    'A Garrafa Terra mantém suas bebidas na temperatura ideal e foi pensada para acompanhar você em qualquer lugar. Seu corpo em aço inoxidável é resistente, não transfere sabores e cabe com facilidade na mochila.',
    'garrafa-terra',
    'accessories',
    'Garrafa térmica de aço inoxidável, com capacidade de 500 ml.',
    99.90,
    119.90,
    4.7,
    42,
    31,
    '/api/imagens/garrafa-terra-cover.jpg',
    FALSE
  );

INSERT INTO produto_model_highlights (produto_model_id, highlights) VALUES
  (UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01'), 'Cancelamento ativo de ruído'),
  (UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01'), 'Até 30 horas de bateria'),
  (UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01'), 'Conexão Bluetooth 5.3'),
  (UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d02'), 'Luz LED ajustável'),
  (UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d02'), 'Braço com ajuste de ângulo'),
  (UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d02'), 'Base compacta'),
  (UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d03'), 'Compartimento para notebook'),
  (UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d03'), 'Tecido resistente à água'),
  (UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d03'), 'Bolsos de acesso rápido'),
  (UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04'), 'Parede dupla de aço inox'),
  (UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04'), 'Mantém bebidas geladas ou quentes'),
  (UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04'), 'Capacidade de 500 ml');

INSERT INTO imagem_model (imagem_id, imagem_url, produto_id) VALUES
  (UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1e01'), '/api/imagens/fones-wave-pro-cover.jpg', UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01')),
  (UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1e02'), '/api/imagens/fones-wave-pro-detail.jpg', UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01')),
  (UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1e03'), '/api/imagens/luminaria-orbit-cover.jpg', UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d02')),
  (UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1e04'), '/api/imagens/mochila-urban-cover.jpg', UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d03')),
  (UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1e05'), '/api/imagens/garrafa-terra-cover.jpg', UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04'));

INSERT INTO variante_model (id, label, value, available, produto_id) VALUES
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1f01', 'Preto', 'preto', TRUE, UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01')),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1f02', 'Branco', 'branco', TRUE, UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01')),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1f03', 'Grafite', 'grafite', TRUE, UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d02')),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1f04', 'Preto', 'preto', FALSE, UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d03')),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1f05', 'Areia', 'areia', TRUE, UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04')),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1f06', 'Verde', 'verde', TRUE, UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04'));

INSERT INTO especificacao_model (id, label, value, produto_id) VALUES
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c01', 'Bateria', 'Até 30 horas', UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01')),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c02', 'Conexão', 'Bluetooth 5.3', UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01')),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c03', 'Peso', '240 g', UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01')),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c04', 'Iluminação', 'LED regulável', UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d02')),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c05', 'Alimentação', 'USB-C', UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d02')),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c06', 'Material', 'Alumínio e ABS', UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d02')),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c07', 'Capacidade', '18 litros', UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d03')),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c08', 'Notebook', 'Até 15 polegadas', UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d03')),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c09', 'Material', 'Poliéster reciclado', UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d03')),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c10', 'Capacidade', '500 ml', UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04')),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c11', 'Material', 'Aço inoxidável', UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04')),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c12', 'Tampa', 'Rosqueável e vedada', UUID_TO_BIN('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04'));
