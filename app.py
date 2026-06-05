import os
import ast
import difflib
import pickle
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.stem.porter import PorterStemmer

# Download NLTK data if needed (usually handled, but done locally or fallback)
try:
    ps = PorterStemmer()
except Exception:
    ps = None

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin frontend queries

# Global variables for model state
movies = None
vectors = None
similarity = None
cv = None

# Helper functions for processing JSON columns in TMDB dataset
def convert_json_list(obj):
    """Parses JSON-like list of dicts to list of names."""
    L = []
    if not isinstance(obj, str):
        return L
    try:
        for i in ast.literal_eval(obj):
            L.append(i['name'])
    except Exception:
        pass
    return L

def convert_cast_list(obj):
    """Parses JSON cast list to return top 3 actors."""
    L = []
    if not isinstance(obj, str):
        return L
    counter = 0
    try:
        for i in ast.literal_eval(obj):
            if counter < 3:
                L.append(i['name'])
                counter += 1
            else:
                break
    except Exception:
        pass
    return L

def fetch_director(obj):
    """Extracts director's name from crew JSON list."""
    if not isinstance(obj, str):
        return ''
    try:
        for i in ast.literal_eval(obj):
            if i['job'] == 'Director':
                return i['name']
    except Exception:
        pass
    return ''

def collapse_spaces(L):
    """Removes spaces inside tags to prevent tokenization splits (e.g. Sam Worthington -> SamWorthington)."""
    return [i.replace(" ", "") for i in L]

def stem_text(text):
    """Applies porter stemming to text."""
    if not ps:
        return text
    y = []
    for i in text.split():
        y.append(ps.stem(i))
    return " ".join(y)

def initialize_model():
    """Loads precomputed movie data and similarity matrix from pickle files."""
    global movies, vectors, similarity, cv
    print("Initializing Movie Recommendation Engine (loading pickles)...")
    
    models_dir = 'models'
    movies_path = os.path.join(models_dir, 'movies.pkl')
    similarity_path = os.path.join(models_dir, 'similarity_top100.pkl')
    vectorizer_path = os.path.join(models_dir, 'vectorizer.pkl')
    vectors_path = os.path.join(models_dir, 'vectors_sparse.pkl')
    
    if not (os.path.exists(movies_path) and os.path.exists(similarity_path) and 
            os.path.exists(vectorizer_path) and os.path.exists(vectors_path)):
        # Fallback to local preprocessing if pickles don't exist
        print("Pickles not found! Running full preprocessing (this may take a while)...")
        from preprocess import main as run_preprocessing
        run_preprocessing()
        
    # Load pickle files
    with open(movies_path, 'rb') as f:
        movies = pickle.load(f)
    with open(similarity_path, 'rb') as f:
        similarity = pickle.load(f)
    with open(vectorizer_path, 'rb') as f:
        cv = pickle.load(f)
    with open(vectors_path, 'rb') as f:
        vectors = pickle.load(f)
        
    print("Model initialized successfully from precomputed files!")

# Load model on startup
try:
    initialize_model()
except Exception as e:
    print(f"FAILED TO INITIALIZE RECOMMENDATION SYSTEM: {e}")

def get_movie_payload(movie_row, score):
    """Formats a DataFrame row into the CineMatch recommended movie JSON structure."""
    genres = movie_row['genres_parsed']
    release_date = str(movie_row['release_date'])
    year = int(release_date[:4]) if release_date and len(release_date) >= 4 else 2024
    
    # Scale match score realistically between 80% and 99%
    match_score = int(80 + (score * 19))
    match_score = max(80, min(99, match_score))
    
    director = movie_row['director_parsed'] or 'Unknown Director'
    primary_genre = genres[0] if genres else 'Drama'
    
    reasons = [
        f"Compelling {primary_genre.lower()} narrative style",
        f"Directed by acclaimed filmmaker {director.split(' ').pop() if ' ' in director else director}",
        f"Highly engaging thematic content"
      ]
      
    return {
        "id": int(movie_row['movie_id']),
        "title": str(movie_row['title']),
        "year": year,
        "rating": float(movie_row['vote_average']) if pd.notna(movie_row['vote_average']) else 7.0,
        "genre": primary_genre,
        "genres": genres[:3],
        "matchScore": match_score,
        "reasons": reasons,
        "overview": str(movie_row['overview'])[:87] + '...' if movie_row['overview'] else 'A fine cinematic feature.',
        "director": director
    }

def vector_search(query, count=6):
    """Calculates query vector similarity against all movie tags."""
    query_stemmed = stem_text(query.lower())
    query_vector = cv.transform([query_stemmed])
    query_similarity = cosine_similarity(query_vector, vectors)[0]
    
    # Sort indices by similarity score descending
    indices = sorted(list(enumerate(query_similarity)), reverse=True, key=lambda x: x[1])
    
    recommended = []
    for idx, score in indices:
        if len(recommended) >= count:
            break
        # Skip items that have zero relevance
        if score <= 0.0 and len(recommended) > 0:
            break
        recommended.append(get_movie_payload(movies.iloc[idx], score))
    return recommended

def recommend_similar(movie_title, count=6):
    """Generates movie recommendations for a given query title or phrase."""
    if movies is None or similarity is None:
        raise ValueError("Recommendation engine not initialized.")
        
    titles_lower = [t.lower() for t in movies['title']]
    query_lower = movie_title.lower().strip()
    
    matched_title = None
    
    # 1. Check exact match case-insensitively
    if query_lower in titles_lower:
        matched_title = movies.iloc[titles_lower.index(query_lower)]['title']
    else:
        # 2. Check misspelled/close match case-insensitively
        matches = difflib.get_close_matches(query_lower, titles_lower, n=1, cutoff=0.6)
        if matches:
            matched_title = movies.iloc[titles_lower.index(matches[0])]['title']

    # 3. If a title is matched, perform content similarity on that movie
    if matched_title:
        movie_idx = movies[movies['title'] == matched_title].index[0]
        # similarity is a dict containing top 100 similarities as (similar_idx, score)
        similar_list = similarity[movie_idx]
        
        recs = []
        for idx, score in similar_list:
            if len(recs) >= count:
                break
            recs.append(get_movie_payload(movies.iloc[idx], score))
            
        return recs
        
    # 4. If no title matched, run query vector semantic matching
    return vector_search(movie_title, count=count)

@app.route('/api/recommend', methods=['GET'])
def recommend_api():
    query = request.args.get('movie', '').strip()
    if not query:
        return jsonify({
            "success": False,
            "message": "Missing 'movie' query parameter."
        }), 400
        
    if movies is None or similarity is None:
        return jsonify({
            "success": False,
            "message": "Recommendation engine not initialized."
        }), 500

    try:
        count = request.args.get('count', default=6, type=int)
        recs = recommend_similar(query, count=count)
        if recs:
            return jsonify({
                "success": True,
                "recommendations": recs
            })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500
        
    # 5. Fail state - provide fallbacks
    fallbacks = [
        "The Dark Knight",
        "Inception",
        "Interstellar",
        "Avatar",
        "Titanic"
    ]
    return jsonify({
        "success": False,
        "message": "Movie not found",
        "fallbacks": fallbacks
    }), 404

GENRE_MAP = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western"
}

@app.route('/api/trending', methods=['GET'])
def trending_api():
    if movies is None:
        return jsonify({"success": False, "message": "Model not initialized"}), 500
    popular_movies = movies.sort_values(by='popularity', ascending=False).head(20)
    recs = []
    for idx, row in popular_movies.iterrows():
        recs.append(get_movie_payload(row, 0.9))
    return jsonify({
        "success": True,
        "results": recs
    })

@app.route('/api/movie/<int:movie_id>', methods=['GET'])
def get_movie_details_api(movie_id):
    if movies is None:
        return jsonify({"success": False, "message": "Model not initialized"}), 500
    movie_rows = movies[movies['movie_id'] == movie_id]
    if movie_rows.empty:
        return jsonify({"success": False, "message": "Movie not found"}), 404
    row = movie_rows.iloc[0]
    return jsonify({
        "success": True,
        "movie": get_movie_payload(row, 1.0)
    })

@app.route('/api/discover', methods=['GET'])
def discover_api():
    if movies is None:
        return jsonify({"success": False, "message": "Model not initialized"}), 500
    genre_id = request.args.get('genre', type=int)
    page = request.args.get('page', default=1, type=int)
    per_page = 20
    
    filtered = movies
    if genre_id in GENRE_MAP:
        genre_name = GENRE_MAP[genre_id]
        filtered = movies[movies['genres_parsed'].apply(lambda g_list: genre_name in g_list)]
        
    start = (page - 1) * per_page
    end = start + per_page
    sliced = filtered.iloc[start:end]
    
    recs = []
    for idx, row in sliced.iterrows():
        recs.append(get_movie_payload(row, 0.8))
        
    total_pages = (len(filtered) + per_page - 1) // per_page
    return jsonify({
        "success": True,
        "results": recs,
        "total_pages": total_pages,
        "total_results": len(filtered)
    })

@app.route('/api/now_playing', methods=['GET'])
def now_playing_api():
    if movies is None:
        return jsonify({"success": False, "message": "Model not initialized"}), 500
    page = request.args.get('page', default=1, type=int)
    per_page = 20
    
    # Sort by release date descending (handling NaNs as last)
    sorted_movies = movies.sort_values(by='release_date', ascending=False, na_position='last')
    start = (page - 1) * per_page
    end = start + per_page
    sliced = sorted_movies.iloc[start:end]
    
    recs = []
    for idx, row in sliced.iterrows():
        recs.append(get_movie_payload(row, 0.8))
        
    return jsonify({
        "success": True,
        "results": recs,
        "total_pages": 5
    })

@app.route('/api/top_rated', methods=['GET'])
def top_rated_api():
    if movies is None:
        return jsonify({"success": False, "message": "Model not initialized"}), 500
    page = request.args.get('page', default=1, type=int)
    per_page = 20
    
    # Sort by vote_average descending
    sorted_movies = movies.sort_values(by='vote_average', ascending=False, na_position='last')
    start = (page - 1) * per_page
    end = start + per_page
    sliced = sorted_movies.iloc[start:end]
    
    recs = []
    for idx, row in sliced.iterrows():
        recs.append(get_movie_payload(row, 0.9))
        
    return jsonify({
        "success": True,
        "results": recs,
        "total_pages": 5
    })

if __name__ == '__main__':
    # Run server dynamically on environment port (Render) or default to 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
