const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

export function convertIPFSUrl(url) {
  if (!url) return url;

  // Check if the URL is an IPFS URL
  if (url.startsWith("ipfs://")) {
    // Remove 'ipfs://' and replace with the gateway URL
    return url.replace("ipfs://", IPFS_GATEWAY);
  }

  // If it's already an HTTP URL or something else, return as is
  return url;
}
