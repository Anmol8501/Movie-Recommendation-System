import os
import ast
import time
import pickle
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.stem.porter import PorterStemmer

def convert_json_list(obj):
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
    return [i.replace(" ", "") for i in L]

def main():
    movies_path = 'tmdb_5000_movies.csv'
    credits_path = 'tmdb_5000_credits.csv'
    models_dir = 'models'
    
    start_time = time.time()
    
    print("Step 1: Loading raw CSV datasets...")
    if not os.path.exists(movies_path) or not os.path.exists(credits_path):
        raise FileNotFoundError("Raw CSV datasets (tmdb_5000_movies.csv and tmdb_5000_credits.csv) must be in the repository root.")
        
    movies_df = pd.read_csv(movies_path)
    credits_df = pd.read_csv(credits_path)
    
    print("Step 2: Merging and preprocessing data...")
    merged_df = movies_df.merge(credits_df, on='title')
    merged_df['overview'] = merged_df['overview'].fillna('')
    
    movies = merged_df[['id', 'title', 'overview', 'genres', 'keywords', 'cast', 'crew', 'release_date', 'vote_average', 'popularity']].copy()
    movies.rename(columns={'id': 'movie_id'}, inplace=True)
    movies = movies.reset_index(drop=True)
    
    movies['genres_parsed'] = movies['genres'].apply(convert_json_list)
    movies['keywords_parsed'] = movies['keywords'].apply(convert_json_list)
    movies['cast_parsed'] = movies['cast'].apply(convert_cast_list)
    movies['director_parsed'] = movies['crew'].apply(fetch_director)
    
    movies['genres_collapsed'] = movies['genres_parsed'].apply(collapse_spaces)
    movies['keywords_collapsed'] = movies['keywords_parsed'].apply(collapse_spaces)
    movies['cast_collapsed'] = movies['cast_parsed'].apply(collapse_spaces)
    movies['director_collapsed'] = movies['director_parsed'].apply(lambda d: [d.replace(" ", "")] if d else [])
    movies['overview_tokens'] = movies['overview'].apply(lambda x: x.split())
    
    movies['tags_list'] = (
        movies['overview_tokens'] + 
        movies['genres_collapsed'] + 
        movies['keywords_collapsed'] + 
        movies['cast_collapsed'] + 
        movies['director_collapsed']
    )
    movies['tags'] = movies['tags_list'].apply(lambda x: " ".join(x).lower())
    
    print("Step 3: Stemming tags...")
    ps = PorterStemmer()
    def stem_text(text):
        y = []
        for i in text.split():
            y.append(ps.stem(i))
        return " ".join(y)
        
    movies['tags'] = movies['tags'].apply(stem_text)
    
    print("Step 4: Fitting CountVectorizer and extracting sparse vectors...")
    cv = CountVectorizer(max_features=5000, stop_words='english')
    vectors_sparse = cv.fit_transform(movies['tags'])
    
    print("Step 5: Calculating cosine similarity matrix...")
    vectors_dense = vectors_sparse.toarray()
    similarity = cosine_similarity(vectors_dense)
    
    print("Step 6: Precomputing top 100 similarities for each movie...")
    top_similarity = {}
    for idx in range(len(similarity)):
        distances = similarity[idx]
        similar_indices = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])
        # Store index 1 to 101 (excluding self, which is at index 0 with score 1.0)
        top_similarity[idx] = similar_indices[1:101]
        
    print("Step 7: Saving optimized files to models/ directory...")
    os.makedirs(models_dir, exist_ok=True)
    
    # Save clean metadata (minimal columns to save RAM)
    movies_clean = movies[['movie_id', 'title', 'overview', 'genres_parsed', 'release_date', 'vote_average', 'director_parsed']].copy()
    
    with open(os.path.join(models_dir, 'movies.pkl'), 'wb') as f:
        pickle.dump(movies_clean, f)
        
    with open(os.path.join(models_dir, 'similarity_top100.pkl'), 'wb') as f:
        pickle.dump(top_similarity, f)
        
    with open(os.path.join(models_dir, 'vectorizer.pkl'), 'wb') as f:
        pickle.dump(cv, f)
        
    with open(os.path.join(models_dir, 'vectors_sparse.pkl'), 'wb') as f:
        pickle.dump(vectors_sparse, f)
        
    print(f"Preprocessing completed successfully in {time.time() - start_time:.2f} seconds!")
    print("Precomputed files generated:")
    for file in ['movies.pkl', 'similarity_top100.pkl', 'vectorizer.pkl', 'vectors_sparse.pkl']:
        path = os.path.join(models_dir, file)
        print(f"  - {path}: {os.path.getsize(path) / (1024*1024):.2f} MB")

if __name__ == '__main__':
    main()
