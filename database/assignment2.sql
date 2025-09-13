-- assignment2.sql
-- CSE 340 - Assignment 2 (Task 1)
-- IMPORTANT: Each task uses a SINGLE query.

-- 1) INSERT Tony Stark (sin account_id ni account_type)
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony','Stark','tony@starkent.com','Iam1IronM@n');

-- 2) UPDATE Tony Stark a Admin (usa PK vía subconsulta)
UPDATE account
SET account_type = 'Admin'
WHERE account_id = (
  SELECT account_id FROM account WHERE account_email = 'tony@starkent.com'
);

-- 3) DELETE Tony Stark (usa PK vía subconsulta)
DELETE FROM account
WHERE account_id = (
  SELECT account_id FROM account WHERE account_email = 'tony@starkent.com'
);

-- 4) REPLACE en la descripción del GM Hummer (NO reescribas todo el texto)
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- 5) INNER JOIN para items de la clasificación 'Sport' (deben salir 2 filas)
SELECT i.inv_make, i.inv_model, c.classification_name
FROM inventory i
INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- 6) Actualiza rutas para incluir '/vehicles' (formato: /images/vehicles/a-car-name.jpg)
UPDATE inventory
SET
  inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
  inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/')
WHERE inv_image NOT LIKE '%/images/vehicles/%' OR inv_thumbnail NOT LIKE '%/images/vehicles/%';
