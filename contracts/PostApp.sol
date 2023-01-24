// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

error SocialMedia__UpkeepNotNeeded();

contract SocialMedia is AutomationCompatibleInterface {
    struct Post {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
        bool isCensored;
        string imageURL;
    }

    // mapping(uint256 => mapping(address => uint256)) public likes; // change to bool
    mapping(uint256 => mapping(address => bool)) public likes;
    mapping(uint256 => mapping(address => bool)) public hasComments; // whether a postId has been liked by an address.
    mapping(uint256 => mapping(address => string)) public comments;

    address[3] public signers; // this array to be updated with the sign-up / sign-in feature.
    address[3] public leaderboard; // this array to be updated by sorting the users by their scores.

    uint256 public numPosts; // number of posts on the deso.
    mapping(uint256 => Post) public posts; // stores all posts on the deso.

    mapping(address => Post[]) public userPosts; // stores all posts on the deso by a particular user.
    mapping(address => uint256) public postCount; // stores the no. of posts on the deso by a particular user.

    uint256 public immutable interval; // time after which the leaderboard needs to be reset.
    uint256 public lastTimestamp; // the last timestamp at which the leaderboard was reset.

    mapping(address => bool) public isModerator; // stores whether a particular address is a moderator or not.
    address public owner; // stores the address of the owner of this contract.
    uint256 idCount;

    event NewPost(address author, string content, uint256 timestamp);
    event NewLike(address postAuthor, address liker);
    event NewComment(address postAuthor, address commenter, string content);
    event CensoredPost(address bostAuthor, uint256 postld);
    event UncensoredPost(address postAuthor, uint256 postld);

    constructor(
        uint256 _interval,
        address _ad1,
        address _ad2,
        address _ad3
    ) {
        owner = msg.sender;
        interval = _interval;
        lastTimestamp = block.timestamp;

        signers[0] = _ad1;
        signers[1] = _ad2;
        signers[2] = _ad3;
    }

    function createPost(string memory _content, string memory _imageURL)
        public
    {
        Post memory post = Post(
            idCount,
            msg.sender,
            _content,
            block.timestamp,
            false,
            _imageURL
        );

        posts[numPosts] = post; // adding to the total no. of posts.
        userPosts[msg.sender].push(post);

        // setting postCount mapping
        numPosts++;
        postCount[msg.sender]++;
        idCount++;

        emit NewPost(msg.sender, _content, block.timestamp);
    }

    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool timePassed = ((block.timestamp - lastTimestamp) > interval);

        upkeepNeeded = timePassed;
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert SocialMedia__UpkeepNotNeeded();
        }

        // Sort the users and update the leaderboard, here hard coding the values.
        leaderboard[0] = signers[1];
        leaderboard[1] = signers[2];
        leaderboard[2] = signers[0];
    }

    // Gets score of a particularuseraddress.
    function getScore(address _address) internal view returns (uint256 score) {
        for (uint256 i = 0; i < numPosts; i++) {
            if (likes[i][_address]) {
                score += 5;
            }

            if (hasComments[i][_address]) {
                score += 10;
            }
        }

        score += (userPosts[_address].length * 10);
    }

    // function likePost(address postAuthor, uint postld) public {
    //     require(postld < postCount[postAuthor], "Invalid post ID.");
    //     require(!userPosts[postAuthor][postld].likes[msg.sender], "Post already liked.");
    //     userPosts [postAuthor][postld].likes[msg.sender] = true;
    //     emit NewLike(postAuthor, msg.sender);
    // }

    // function commentOnPost(address postAuthor, uint postld, string memory content) public {
    //     require(postld < postCount[postAuthor], "Invalid post ID.");
    //     userPosts [postAuthor][postld].comments[msg.sender] = content;
    //     emit NewComment(postAuthor, msg.sender, content);
    // }

    function getPosts(address user) internal view returns (Post[] storage) {
        return userPosts[user];
    }

    function getPostCount(address user) public view returns (uint256) {
        return postCount[user];
    }

    function addModerator(address user) public onlyOwner {
        require(!isModerator[user], "User is already a moderator.");
        isModerator[user] = true;
    }

    function removeModerator(address user) public onlyOwner {
        require(isModerator[user], "User is not a moderator.");
        isModerator[user] = false;
    }

    function censorPost(address postAuthor, uint256 postld)
        public
        onlyModerator
    {
        require(postld < postCount[postAuthor], "Invalid post ID.");
        require(
            !userPosts[postAuthor][postld].isCensored,
            "Post is already censored."
        );
        userPosts[postAuthor][postld].isCensored = true;
        emit CensoredPost(postAuthor, postld);
    }

    function uncensorPost(address postAuthor, uint256 postld)
        public
        onlyModerator
    {
        require(postld < postCount[postAuthor], "Invalid post ID.");
        require(
            userPosts[postAuthor][postld].isCensored,
            "Post is not censored."
        );
        userPosts[postAuthor][postld].isCensored = false;
        emit UncensoredPost(postAuthor, postld);
    }

    // access control
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    modifier onlyModerator() {
        require(
            isModerator[msg.sender],
            "Only moderators can perform this action."
        );
        _;
    }
}
