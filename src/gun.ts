import Gun from 'gun' // You can also use 'gun' here
import 'gun/sea' // Optional: for user authentication
import 'gun/lib/unset'; //optional

// Use Gun.js peers from environment or default to common peers
const peers = import.meta.env.VITE_GUN_PEERS?.split(',') || [
  'https://gun-manhattan.herokuapp.com/gun',
  'https://relay.peers.community/gun',
  'https://gun-sjc.herokuapp.com/gun'
];
const gun = Gun(peers) as any;

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