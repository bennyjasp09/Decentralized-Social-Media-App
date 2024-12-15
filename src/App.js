import { useEffect, useState } from "react";
import {
  urlClient,
  LENS_HUB_CONTRACT_ADDRESS,
  queryRecommendedProfiles,
  queryExplorePublications,
} from "./queries";
import LENSHUB from "./lenshub";
import { ethers, providers } from "ethers";
import { Box, Button, Image } from "@chakra-ui/react";

function App() {
  const [account, setAccount] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [posts, setPosts] = useState([]);

  // Function to connect wallet
  async function signIn() {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  }

  // Fetch recommended profiles
  async function getRecommendedProfiles() {
    try {
      const response = await urlClient.query(queryRecommendedProfiles).toPromise();
      const profiles = response?.data?.recommendedProfiles?.slice(0, 5) || [];
      setProfiles(profiles);
    } catch (error) {
      console.error("Error fetching recommended profiles:", error);
    }
  }

  // Fetch posts
  async function getPosts() {
    try {
      const response = await urlClient.query(queryExplorePublications).toPromise();
      const posts =
        response?.data?.explorePublications?.items?.filter((post) => post.profile) || [];
      setPosts(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  // Follow a profile
  async function follow(id) {
    try {
      if (!id) {
        console.error("Invalid profile ID:", id);
        return;
      }
      const provider = new providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(LENS_HUB_CONTRACT_ADDRESS, LENSHUB, signer);
      const tx = await contract.follow([parseInt(id)], [0x0]);
      await tx.wait();
      alert(`Successfully followed profile ID: ${id}`);
    } catch (error) {
      console.error("Error following profile:", error);
    }
  }

  useEffect(() => {
    getRecommendedProfiles();
    getPosts();
  }, []);

  // Parse image URL
  const parseImageUrl = (profile) => {
    if (profile) {
      const url = profile.picture?.original?.url;
      if (url?.startsWith("ipfs:")) {
        const ipfsHash = url.split("//")[1];
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      }
      return url || "/default-avatar.png";
    }
    return "/default-avatar.png";
  };

  return (
    <div className="app">
      {/* NAVBAR */}
      <Box width="100%" backgroundColor="rgba(5, 32, 64, 28)">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="55%"
          margin="auto"
          color="white"
          padding="10px 0"
        >
          <Box>
            <Box fontFamily="DM Serif Display" fontSize="44px" fontStyle="italic">
              DECENTRA
            </Box>
            <Box> Decentralized Social Media App</Box>
          </Box>
          {account ? (
            <Box backgroundColor="#000" padding="15px" borderRadius="6px">
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </Box>
          ) : (
            <Button
              onClick={signIn}
              color="rgba(5,32,64)"
              _hover={{ backgroundColor: "#808080" }}
            >
              Connect
            </Button>
          )}
        </Box>
      </Box>

      {/* CONTENT */}
      <Box
        display="flex"
        justifyContent="space-between"
        width="55%"
        margin="35px auto auto auto"
        color="white"
      >
        {/* POSTS */}
        <Box width="65%" maxWidth="65%" minWidth="65%">
          {posts.map((post) => (
            <Box
              key={post.id}
              marginBottom="25px"
              backgroundColor="rgba(5, 32, 64, 28)"
              padding="40px 30px 40px 25px"
              borderRadius="6px"
            >
              <Box display="flex">
                {/* PROFILE IMAGE */}
                <Box width="75px" height="75px" marginTop="8px">
                  <img
                    alt="profile"
                    src={parseImageUrl(post.profile)}
                    width="75px"
                    height="75px"
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null; // prevents looping
                      currentTarget.src = "/default-avatar.png";
                    }}
                  />
                </Box>

                {/* POST CONTENT */}
                <Box flexGrow={1} marginLeft="20px">
                  <Box display="flex" justifyContent="space-between">
                    <Box fontFamily="DM Serif Display" fontSize="24px">
                      {post.profile?.handle}
                    </Box>
                    <Box height="50px" _hover={{ cursor: "pointer" }}>
                      <Image
                        alt="follow-icon"
                        src="/follow-icon.png"
                        width="50px"
                        height="50px"
                        onClick={() => follow(post.profile.id)}
                      />
                    </Box>
                  </Box>
                  <Box overflowWrap="anywhere" fontSize="14px">
                    {post.metadata?.content || "No content available"}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* FRIEND SUGGESTIONS */}
        <Box
          width="30%"
          backgroundColor="rgba(5, 32, 64, 28)"
          padding="40px 25px"
          borderRadius="6px"
          height="fit-content"
        >
          <Box fontFamily="DM Serif Display">FRIEND SUGGESTIONS</Box>
          <Box>
            {profiles.map((profile) => (
              <Box
                key={profile.id}
                margin="30px 0"
                display="flex"
                alignItems="center"
                height="40px"
                _hover={{ color: "#808080", cursor: "pointer" }}
              >
                <img
                  alt="profile"
                  src={parseImageUrl(profile)}
                  width="40px"
                  height="40px"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = "/default-avatar.png";
                  }}
                />
                <Box marginLeft="25px">
                  <h4>{profile.name || "Anonymous"}</h4>
                  <p>{profile.handle}</p>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </div>
  );
}

export default App;
