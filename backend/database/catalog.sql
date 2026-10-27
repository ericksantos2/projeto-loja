USE api_produtos;

CREATE TABLE IF NOT EXISTS produto_model (
  id CHAR(36) NOT NULL,
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
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS produto_model_highlights (
  produto_model_id CHAR(36) NOT NULL,
  highlights VARCHAR(255),
  CONSTRAINT fk_highlights_produto FOREIGN KEY (produto_model_id) REFERENCES produto_model(id)
);

CREATE TABLE IF NOT EXISTS imagem_model (
  imagem_id CHAR(36) NOT NULL,
  imagem_url VARCHAR(255),
  produto_id CHAR(36),
  PRIMARY KEY (imagem_id),
  CONSTRAINT fk_imagem_produto FOREIGN KEY (produto_id) REFERENCES produto_model(id)
);

CREATE TABLE IF NOT EXISTS variante_model (
  id CHAR(36) NOT NULL,
  label VARCHAR(255),
  value VARCHAR(255),
  available BOOLEAN,
  produto_id CHAR(36),
  PRIMARY KEY (id),
  CONSTRAINT fk_variante_produto FOREIGN KEY (produto_id) REFERENCES produto_model(id)
);

CREATE TABLE IF NOT EXISTS especificacao_model (
  id CHAR(36) NOT NULL,
  label VARCHAR(255),
  value VARCHAR(255),
  produto_id CHAR(36),
  PRIMARY KEY (id),
  CONSTRAINT fk_especificacao_produto FOREIGN KEY (produto_id) REFERENCES produto_model(id)
);

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
  imagem_principal
) VALUES
  (
    '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01',
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
    '/api/imagens/fones-wave-pro-cover.jpg'
  ),
  (
    '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d02',
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
    '/api/imagens/luminaria-orbit-cover.jpg'
  ),
  (
    '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d03',
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
    '/api/imagens/mochila-urban-cover.jpg'
  ),
  (
    '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04',
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
    '/api/imagens/garrafa-terra-cover.jpg'
  );

INSERT INTO produto_model_highlights (produto_model_id, highlights) VALUES
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01', 'Cancelamento ativo de ruído'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01', 'Até 30 horas de bateria'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01', 'Conexão Bluetooth 5.3'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d02', 'Luz LED ajustável'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d02', 'Braço com ajuste de ângulo'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d02', 'Base compacta'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d03', 'Compartimento para notebook'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d03', 'Tecido resistente à água'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d03', 'Bolsos de acesso rápido'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04', 'Parede dupla de aço inox'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04', 'Mantém bebidas geladas ou quentes'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04', 'Capacidade de 500 ml');

INSERT INTO imagem_model (imagem_id, imagem_url, produto_id) VALUES
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1e01', '/api/imagens/fones-wave-pro-cover.jpg', '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1e02', '/api/imagens/fones-wave-pro-detail.jpg', '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1e03', '/api/imagens/luminaria-orbit-cover.jpg', '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d02'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1e04', '/api/imagens/mochila-urban-cover.jpg', '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d03'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1e05', '/api/imagens/garrafa-terra-cover.jpg', '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04');

INSERT INTO variante_model (id, label, value, available, produto_id) VALUES
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1f01', 'Preto', 'preto', TRUE, '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1f02', 'Branco', 'branco', TRUE, '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1f03', 'Grafite', 'grafite', TRUE, '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d02'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1f04', 'Preto', 'preto', FALSE, '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d03'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1f05', 'Areia', 'areia', TRUE, '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1f06', 'Verde', 'verde', TRUE, '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04');

INSERT INTO especificacao_model (id, label, value, produto_id) VALUES
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c01', 'Bateria', 'Até 30 horas', '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c02', 'Conexão', 'Bluetooth 5.3', '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c03', 'Peso', '240 g', '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d01'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c04', 'Iluminação', 'LED regulável', '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d02'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c05', 'Alimentação', 'USB-C', '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d02'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c06', 'Material', 'Alumínio e ABS', '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d02'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c07', 'Capacidade', '18 litros', '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d03'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c08', 'Notebook', 'Até 15 polegadas', '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d03'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c09', 'Material', 'Poliéster reciclado', '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d03'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c10', 'Capacidade', '500 ml', '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c11', 'Material', 'Aço inoxidável', '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04'),
  ('7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1c12', 'Tampa', 'Rosqueável e vedada', '7c6fc4df-3d9e-4e39-91ae-7a5c7a6b1d04');
