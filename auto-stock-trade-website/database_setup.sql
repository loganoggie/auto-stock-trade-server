CREATE TABLE users (
  first     VARCHAR(100)    NOT NULL,
  last      VARCHAR(100)    NOT NULL,
  email     VARCHAR(100)    NOT NULL,
  password  VARCHAR(100)    NOT NULL,
  PRIMARY KEY(email, password)
);
