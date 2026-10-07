import { db } from '../firebase'; // Assuming your firebase config is here
import { collection, getDocs, query, where, limit, doc, getDoc } from 'firebase/firestore';

// Fetch all blog posts for the listing page
export async function fetchBlogPosts() {
  try {
    const querySnapshot = await getDocs(collection(db, 'posts'));
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return posts;
  } catch (error) {
    console.error("Error fetching blog posts: ", error);
    return [];
  }
}

// Fetch a single blog post by its slug (for SEO & dynamic routing)
export async function fetchPostBySlug(slug) {
  try {
    const q = query(collection(db, 'posts'), where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    
    const postDoc = querySnapshot.docs[0];
    return { id: postDoc.id, ...postDoc.data() };
  } catch (error) {
    console.error("Error fetching post by slug: ", error);
    return null;
  }
}