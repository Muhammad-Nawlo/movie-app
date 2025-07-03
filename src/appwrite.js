import {Client, Databases, ID, Query} from "appwrite";

const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID
const DB_ID = import.meta.env.VITE_APPWRITE_DB_ID
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID

const client = new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(PROJECT_ID);
const db = new Databases(client);

export const updateSearchCount = async (search, movie) => {
    try {
        const result = await db.listDocuments(DB_ID, COLLECTION_ID, [
            Query.equal('search', search)
        ]);
        if (result.documents.length > 0) {
            const doc = result.documents[0];
            await db.updateDocument(DB_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1
            })
        } else {
            await db.createDocument(DB_ID, COLLECTION_ID, ID.unique(), {
                search,
                count: 1,
                poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
                movie_id: movie.id
            })
        }

    } catch (error) {
        console.error(error);
    }
}
export const getTrendingMovies = async () => {
    try {
        const result = await db.listDocuments(DB_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc('count')
        ])
        return result.documents;
    } catch (error) {
        console.error(error);
    }
}