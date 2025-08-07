import Gun from 'gun' // You can also use 'gun' here
import 'gun/sea' // Optional: for user authentication
import 'gun/lib/unset'; //optional

// Use Gun.js peers from environment or default to local storage only for development
const peers = import.meta.env.VITE_GUN_PEERS?.split(',') || [];

// For development, use local storage only to avoid connection issues
const gun = Gun({
  peers: peers.length > 0 ? peers : undefined, // Only use peers if specified
  localStorage: true, // Always use localStorage for persistence
  radisk: true, // Use radisk for better performance
}) as any;

console.log('Gun.js initialized with peers:', peers.length > 0 ? peers : 'local only');

gun.clear = function() {
	// Clear localStorage
	localStorage.clear();

	// If using sessionStorage
	sessionStorage.clear();

	// Optionally clear IndexedDB (requires async code)
	indexedDB.databases().then(dbs => {
	  for (let db of dbs) {
	    indexedDB.deleteDatabase(db.name!);
	  }
	});

	console.log('Local data cleared');
}

gun.lookup = async function(key: string, id: string) {
	const ref = await gun.get(key).get(id).once();
  const soul = ref?._ && (ref._ as any)['#'];
  if (!soul) return null;
  const data = await gun.get(soul).once();
  return data ? { id, ...data } : null;
}

export default gun;