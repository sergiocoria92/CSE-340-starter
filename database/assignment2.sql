-- /database/assignment2.sql
-- Task 1 - TODAS las sentencias en UN SOLO archivo

-- 2) Tony Stark - INSERT
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony','Stark','tony@starkindustries.com','IAmIronman');

-- 3) Tony Stark - UPDATE (ej.: cambia email)
UPDATE account
SET account_email = 'tony@avengers.org'
WHERE account_firstname = 'Tony' AND account_lastname = 'Stark';

-- 4) Tony Stark - DELETE
DELETE FROM account
WHERE account_firstname = 'Tony' AND account_lastname = 'Stark';

-- 5) Descripción Hummer debe contener "a huge interior"
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make='GM' AND inv_model='Hummer';

-- 6) SELECT con JOIN: para 'Sport' deben salir 2 filas (Mustang y Corvette)
SELECT i.inv_make, i.inv_model, c.classification_name
FROM inventory i
JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_name='Sport';

-- 7) Actualiza inv_image e inv_thumbnail al nuevo prefijo
UPDATE inventory
SET inv_image     = REPLACE(inv_image,     '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
