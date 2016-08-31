DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS tracks;
DROP TABLE IF EXISTS missions;
DROP TABLE IF EXISTS mission_dependencies;
DROP TABLE IF EXISTS testcases;
DROP TABLE IF EXISTS stars;
DROP TABLE IF EXISTS track_status;
DROP TABLE IF EXISTS mission_status;
DROP TABLE IF EXISTS star_status;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS friend_events;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS types;
DROP TABLE IF EXISTS statuses;
DROP TABLE IF EXISTS achievement_unlocks;


CREATE TABLE players(
	id 		INTEGER PRIMARY KEY 	AUTOINCREMENT,
	first_name 	VARCHAR(50)		DEFAULT "",
	last_name 	VARCHAR(255)		DEFAULT "",
	date_joined 	INTEGER 		NOT NULL,
	score 		INTEGER 		DEFAULT 0
);

CREATE TABLE friends(
	player_id1 	INTEGER,
	player_id2 	INTEGER,

	PRIMARY KEY(player_id1, player_id2),
	FOREIGN KEY(player_id1) REFERENCES players(id),
	FOREIGN KEY(player_id2) REFERENCES players(id)
);

CREATE TABLE category(
	id 		INTEGER PRIMARY KEY 	AUTOINCREMENT,
	title 		VARCHAR(100) 		NOT NULL,
	description 	TEXT			DEFAULT ""
);

CREATE TABLE tracks(
	id 		INTEGER PRIMARY KEY 	AUTOINCREMENT,
	slug		VARCHAR(50)		UNIQUE NOT NULL,
	title 		VARCHAR(50) 		NOT NULL,
	description	TEXT			DEFAULT "",
	category 	INTEGER 		NOT NULL,

	FOREIGN KEY(category) REFERENCES category(id)
);

CREATE TABLE missions(
	id 		INTEGER PRIMARY KEY 	AUTOINCREMENT,
	slug		VARCHAR(50)		UNIQUE NOT NULL,
	title 		VARCHAR(50) 		NOT NULL,
	track 		INTEGER 		NOT NULL,
	description	TEXT			DEFAULT "",
	reward 		INTEGER 		DEFAULT 0,

	FOREIGN KEY(track) REFERENCES tracks(id)
);

CREATE TABLE mission_dependencies(
	mission_id 	INTEGER 		NOT NULL,
	parent_id 	INTEGER 		NOT NULL,
	PRIMARY KEY (mission_id, parent_id),

	FOREIGN KEY(mission_id) REFERENCES missions(id),
	FOREIGN KEY(parent_id) REFERENCES missions(id)
);

CREATE TABLE testcases(
	id 		INTEGER PRIMARY KEY 	AUTOINCREMENT,
	mission_id 	INTEGER 		NOT NULL,
	root_uri	TEXT			NOT NULL,

	FOREIGN KEY(mission_id) REFERENCES missions(id)
);

CREATE TABLE types(
	id 		INTEGER PRIMARY KEY AUTOINCREMENT,
	description	TEXT 		NOT NULL
);

CREATE TABLE stars(
	id 		INTEGER PRIMARY KEY 	AUTOINCREMENT,
	mission_id 	INTEGER 		NOT NULL,
	score 		INTEGER 		DEFAULT 0,
	type 		INTEGER 		NOT NULL,

	FOREIGN KEY(mission_id) REFERENCES missions(id),
	FOREIGN KEY(type) REFERENCES types(id)
);

CREATE TABLE statuses(
	id		INTEGER PRIMARY KEY	AUTOINCREMENT,
	description	TEXT			NOT NULL
);

CREATE TABLE track_status(
	track_id	INTEGER,
	player_id 	INTEGER,
	status 		INTEGER		NOT NULL,
	PRIMARY KEY(track_id, player_id),

	FOREIGN KEY(track_id) REFERENCES tracks(id),
	FOREIGN KEY(player_id) REFERENCES players(id),
	FOREIGN KEY(status) REFERENCES stauses(id)
);

CREATE TABLE mission_status(
	mission_id	INTEGER,
	player_id	INTEGER,
	status 		INTEGER			NOT NULL,
	PRIMARY KEY(mission_id, player_id),

	FOREIGN KEY(mission_id) REFERENCES missions(id),
	FOREIGN KEY(player_id) REFERENCES players(id),
	FOREIGN KEY(status) REFERENCES stauses(id)
);

CREATE TABLE star_status(
	star_id		INTEGER,
	player_id	INTEGER,
	submission	INTEGER		NOT NULL,
	status 		BOOLEAN		DEFAULT FALSE,
	best_score 	INTEGER 	DEFAULT 0,
	PRIMARY KEY(star_id, player_id),

	FOREIGN KEY(star_id) REFERENCES stars(id),
	FOREIGN KEY(player_id) REFERENCES players(id),
	FOREIGN KEY(submission) REFERENCES submissions(id)
);

CREATE TABLE events(
	id 		INTEGER PRIMARY KEY AUTOINCREMENT,
	type 		INTEGER 	NOT NULL,
	datetime 	INTEGER 	NOT NULL,

	FOREIGN KEY(type) REFERENCES types(id)
);

CREATE TABLE submissions(
	id 		INTEGER PRIMARY KEY AUTOINCREMENT,
	event_id 	INTEGER 	NOT NULL,
	player_id 	INTEGER 	NOT NULL,
	mission_id	VARCHAR(100) 	NOT NULL,
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
	status 		INTEGER		NOT NUlL,

	FOREIGN KEY(event_id) REFERENCES events(id),
	FOREIGN KEY(player_id1) REFERENCES players(id),
	FOREIGN KEY(player_id2) REFERENCES players(id),
	FOREIGN KEY(status) REFERENCES statuses(id)
);

CREATE TABLE achievements(
	id		INTEGER	PRIMARY KEY AUTOINCREMENT,
	title		VARCHAR(50)	NOT NULL,
	description	TEXT,
	type 		INTEGER		NOT NULL,

	FOREIGN KEY(type) REFERENCES types(id)
);

CREATE TABLE achievement_unlocks(
	event_id 	INTEGER 	NOT NULL,
	achievement	INTEGER,
	player_id 	INTEGER,

	PRIMARY KEY(achievement, player_id),

	FOREIGN KEY(event_id) REFERENCES events(id),
	FOREIGN KEY(player_id) REFERENCES players(id),
	FOREIGN KEY(achievement) REFERENCES achievements(id)
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

-- For fast retrieval for TOP n front page
CREATE INDEX top_players ON players (score DESC);
