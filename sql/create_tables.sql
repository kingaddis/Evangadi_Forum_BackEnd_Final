-- Create userTable
CREATE TABLE userTable (
    userid SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    firstname VARCHAR(20) NOT NULL,
    lastname VARCHAR(20) NOT NULL,
    password VARCHAR(100) NOT NULL,
    reset_token TEXT,
    reset_token_expiry BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categoryTable
CREATE TABLE categoryTable (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Insert predefined categories
INSERT INTO categoryTable (name) VALUES
    ('JavaScript'),
    ('Python'),
    ('Java'),
    ('HTML'),
    ('CSS'),
    ('SQL'),
    ('Node.js'),
    ('React'),
    ('DevOps'),
    ('Cybersecurity'),
    ('Others')
ON CONFLICT (name) DO NOTHING;

-- Create tagTable
CREATE TABLE tagTable (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Create questionTable
CREATE TABLE questionTable (
    id SERIAL PRIMARY KEY,
    questionid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    userid INTEGER NOT NULL REFERENCES userTable(userid) ON DELETE CASCADE,
    categoryId INTEGER NOT NULL REFERENCES categoryTable(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create answerTable
CREATE TABLE answerTable (
    answerid SERIAL PRIMARY KEY,
    questionid UUID NOT NULL REFERENCES questionTable(questionid) ON DELETE CASCADE,
    userid INTEGER NOT NULL REFERENCES userTable(userid) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ratingTable
CREATE TABLE ratingTable (
    id SERIAL PRIMARY KEY,
    answerId INTEGER NOT NULL REFERENCES answerTable(answerid) ON DELETE CASCADE,
    userId INTEGER NOT NULL REFERENCES userTable(userid) ON DELETE CASCADE,
    rating FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_answer_user_rating UNIQUE (answerId, userId)
);

-- Create QuestionTag (junction table for question and tag many-to-many relationship)
CREATE TABLE QuestionTag (
    questionId INTEGER NOT NULL REFERENCES questionTable(id) ON DELETE CASCADE,
    tagId INTEGER NOT NULL REFERENCES tagTable(id) ON DELETE CASCADE,
    CONSTRAINT unique_question_tag UNIQUE (questionId, tagId)
);

-- Create indexes for better query performance
CREATE INDEX idx_question_questionid ON questionTable(questionid);
CREATE INDEX idx_answer_questionid ON answerTable(questionid);
CREATE INDEX idx_rating_answerId ON ratingTable(answerId);
CREATE INDEX idx_questiontag_questionId ON QuestionTag(questionId);
CREATE INDEX idx_questiontag_tagId ON QuestionTag(tagId);