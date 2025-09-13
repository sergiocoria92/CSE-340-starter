-- db-rebuild.sql
-- CSE 340 - Assignment 2 (Task 2)
-- Rebuild de la base en una DB NUEVA de Render.

-- 1) DROP (seguro)
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS classification CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TYPE  IF EXISTS account_type;

-- 2) TYPE
CREATE TYPE account_type AS ENUM ('Client','Admin');

-- 3) TABLES
CREATE TABLE account (
  account_id SERIAL PRIMARY KEY,
  account_firstname VARCHAR(255) NOT NULL,
  account_lastname  VARCHAR(255) NOT NULL,
  account_email     VARCHAR(255) UNIQUE NOT NULL,
  account_password  VARCHAR(255) NOT NULL,
  account_type      account_type NOT NULL DEFAULT 'Client'
);

CREATE TABLE classification (
  classification_id   SERIAL PRIMARY KEY,
  classification_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE inventory (
  inv_id         SERIAL PRIMARY KEY,
  inv_make       VARCHAR(50) NOT NULL,
  inv_model      VARCHAR(50) NOT NULL,
  inv_description TEXT NOT NULL,
  inv_image      VARCHAR(255) NOT NULL,
  inv_thumbnail  VARCHAR(255) NOT NULL,
  inv_price      NUMERIC(12,2) NOT NULL,
  inv_miles      INTEGER NOT NULL,
  inv_color      VARCHAR(50) NOT NULL,
  classification_id INTEGER NOT NULL REFERENCES classification(classification_id)
);

-- 4) SEED DATA
INSERT INTO classification (classification_name)
VALUES ('Sport'), ('SUV'), ('Sedan');

INSERT INTO inventory (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
VALUES
  ('Ford','Mustang',
   'Classic sport coupe with agile handling.',
   '/images/mustang.jpg','/images/mustang-tn.jpg', 35000.00, 15000, 'Red',
   (SELECT classification_id FROM classification WHERE classification_name='Sport')),
  ('Chevrolet','Corvette',
   'High-performance sport car with a powerful engine.',
   '/images/corvette.jpg','/images/corvette-tn.jpg', 72000.00, 5000, 'Blue',
   (SELECT classification_id FROM classification WHERE classification_name='Sport'));

INSERT INTO inventory (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
VALUES
  ('GM','Hummer',
   'Rugged off-road capability but noted for small interiors in this trim.',
   '/images/hummer.jpg','/images/hummer-tn.jpg', 88000.00, 12000, 'Black',
   (SELECT classification_id FROM classification WHERE classification_name='SUV'));

-- 5) ÚLTIMO: copias de #4 y #6 del Task 1
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

UPDATE inventory
SET
  inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
  inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/')
WHERE inv_image NOT LIKE '%/images/vehicles/%' OR inv_thumbnail NOT LIKE '%/images/vehicles/%';
