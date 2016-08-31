DROP TABLE players;
DROP TABLE friends;
DROP TABLE category;
DROP TABLE tracks;
DROP TABLE missions;
DROP TABLE mission_dependencies;
DROP TABLE testcases;
DROP TABLE stars;
DROP TABLE track_status;
DROP TABLE mission_status;
DROP TABLE star_status;
DROP TABLE events;
DROP TABLE submissions;
DROP TABLE friend_events;
DROP TABLE achievements;
DROP TABLE notifications;


CREATE TABLE players(
	id 		INTEGER PRIMARY KEY 	AUTOINCREMENT,
	first_name 	VARCHAR(50),
	last_name 	VARCHAR(255),
	date_joined 	INTEGER 		NOT NULL,
	score 		INTEGER 		DEFAULT 0
);

CREATE TABLE friends(
	player_id1 	INTEGER,
	player_id2 	INTEGER,
	status 		VARCHAR(50),

	FOREIGN KEY(player_id1) REFERENCES players(id),
	FOREIGN KEY(player_id2) REFERENCES players(id)
);

CREATE TABLE category(
	id 		INTEGER PRIMARY KEY 	AUTOINCREMENT,
	title 		VARCHAR(100) 		NOT NULL,
	description 	TEXT
);

CREATE TABLE tracks(
	id 		VARCHAR(50) PRIMARY KEY NOT NULL,
	title 		VARCHAR(50) 		NOT NULL,
	description	TEXT,
	category 	INTEGER 		NOT NULL,

	FOREIGN KEY(category) REFERENCES category(id)
);

CREATE TABLE missions(
	id 		VARCHAR(50) PRIMARY KEY NOT NULL,
	title 		VARCHAR(50) 		NOT NULL,
	track 		INTEGER 		NOT NULL,
	description	TEXT,
	reward 		INTEGER 		DEFAULT 0,

	FOREIGN KEY(track) REFERENCES tracks(id)
);

CREATE TABLE mission_dependencies(
	mission_id 	VARCHAR(50) 		NOT NULL,
	parent_id 	VARCHAR(50) 		NOT NULL,
	PRIMARY KEY (mission_id, parent_id),

	FOREIGN KEY(mission_id) REFERENCES missions(id),
	FOREIGN KEY(parent_id) REFERENCES missions(id)
);

CREATE TABLE testcases(
	id 		INTEGER PRIMARY KEY 	NOT NULL,
	mission_id 	VARCHAR(50) 		NOT NULL,
	input 		BLOB,
	output 		BLOB,

	FOREIGN KEY(mission_id) REFERENCES missions(id)

);

CREATE TABLE stars(
	id 		INTEGER PRIMARY KEY 	AUTOINCREMENT,
	mission_id 	VARCHAR(50) 		NOT NULL,
	score 		INTEGER 		DEFAULT 0,
	type 		VARCHAR(50) 		NOT NULL,

	FOREIGN KEY(mission_id) REFERENCES missions(id)
);

CREATE TABLE track_status(
	track_id	VARCHAR(50) 	NOT NULL,
	player_id 	INTEGER 	NOT NULL,
	status 		VARCHAR(50),
	PRIMARY KEY(track_id, player_id),

	FOREIGN KEY(track_id) REFERENCES tracks(id),
	FOREIGN KEY(player_id) REFERENCES players(id)
);

CREATE TABLE mission_status(
	mission_id	VARCHAR(50) 		NOT NULL,
	player_id	INTEGER 		NOT NULL,
	status 		VARCHAR(50),
	PRIMARY KEY(mission_id, player_id),

	FOREIGN KEY(mission_id) REFERENCES missions(id),
	FOREIGN KEY(player_id) REFERENCES players(id)
);

CREATE TABLE star_status(
	star_id		INTEGER 	NOT NULL,
	player_id	INTEGER 	NOT NULL,
	status 		BOOLEAN,
	best_score 	INTEGER 	DEFAULT 0,
	PRIMARY KEY(star_id, player_id),

	FOREIGN KEY(star_id) REFERENCES stars(id),
	FOREIGN KEY(player_id) REFERENCES players(id)
);

CREATE TABLE events(
	id 		INTEGER PRIMARY KEY AUTOINCREMENT,
	type 		VARCHAR(50) 	NOT NULL,
	datetime 	INTEGER 	NOT NULL
);

CREATE TABLE submissions(
	id 		INTEGER PRIMARY KEY AUTOINCREMENT,
	event_id 	INTEGER 	NOT NULL,
	player_id 	INTEGER 	NOT NULL,
	mission_id	VARCHAR(50) 	NOT NULL,
	solved 		BOOLEAN 	DEFAULT FALSE,

	FOREIGN KEY(event_id) REFERENCES events(id),
	FOREIGN KEY(player_id) REFERENCES players(id),
	FOREIGN KEY(mission_id) REFERENCES missions(id)
);

CREATE TABLE friend_events(
	id 		INTEGER PRIMARY KEY AUTOINCREMENT,
	event_id 	INTEGER 	NOT NULL,
	player_id1 	INTEGER 	NOT NULL,
	player_id2 	INTEGER 	NOT NULL,
	status 		VARCHAR(50),

	FOREIGN KEY(event_id) REFERENCES events(id),
	FOREIGN KEY(player_id1) REFERENCES players(id),
	FOREIGN KEY(player_id2) REFERENCES players(id)
);

CREATE TABLE achievements(
	id 		INTEGER PRIMARY KEY AUTOINCREMENT,
	event_id 	INTEGER 	NOT NULL,
	player_id 	INTEGER 	NOT NULL,
	title 		VARCHAR(50) 	NOT NULL,
	description	TEXT,
	type 		VARCHAR(50) 	NOT NULL,

	FOREIGN KEY(event_id) REFERENCES events(id),
	FOREIGN KEY(player_id) REFERENCES players(id)
);

CREATE TABLE notifications(
	id 		INTEGER PRIMARY KEY AUTOINCREMENT,
	event_id 	INTEGER 	NOT NULL,
	player_id 	INTEGER 	NOT NULL,
	icon 		VARCHAR(50),
	body 		TEXT,

	FOREIGN KEY(event_id) REFERENCES events(id),
	FOREIGN KEY(player_id) REFERENCES players(id)
);
