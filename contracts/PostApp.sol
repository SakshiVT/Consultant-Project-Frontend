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

    address[] public users; // this array to be updated with the sign-up / sign-in feature.
    address[] public leaderboard; // this array to be updated by sorting the users by their scores.

    uint256 public numPosts; // number of posts on the deso.
    mapping(uint256 => Post) public posts; // stores all posts on the deso.

    mapping(address => Post[]) public userPosts; // stores all posts on the deso by a particular user.
    mapping(address => uint256[]) public postCount; // stores the no. of posts on the deso by a particular user.

    uint256 public immutable interval; // time after which the leaderboard needs to be reset.
    uint256 public lastTimestamp; // the last timestamp at which the leaderboard was reset.

    mapping(address => uint256) public scores; // stores the scores of all users.

    mapping(address => bool) public isModerator; // stores whether a particular address is a moderator or not.
    address public owner; // stores the address of the owner of this contract.
    uint256 idCount;

    bytes public leaderData;

    event NewPost(
        uint256 postId,
        address author,
        string content,
        uint256 timestamp,
        bool isCensored,
        string imageURL
    );
    event NewLike(
        address postAuthor,
        address likedBy,
        uint256 postId,
        bool like,
        uint256 authorScore
    );
    event NewComment(
        address postAuthor,
        address commentedBy,
        uint256 postId,
        string content,
        uint256 authorScore
    );
    event DeleteComment(
        address postAuthor,
        address commentBy,
        uint256 postId,
        uint256 authorScore
    );
    event DeletePost(uint256 postId, address postAuthor);
    event EditPost(
        uint256 postId,
        address author,
        string content,
        uint256 timestamp,
        bool isCensored,
        string imageURL
    );

    event CensoredPost(address postAuthor, uint256 postld);
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

        users.push(_ad1);
        users.push(_ad2);
        users.push(_ad3);

        leaderboard.push(_ad1);
        leaderboard.push(_ad2);
        leaderboard.push(_ad3);
    }

    function createPost(
        string memory _content,
        string memory _imageURL,
        bool _isCensored
    ) public {
        uint256 time = block.timestamp;
        uint256 postId = numPosts;
        Post memory post = Post(
            postId,
            msg.sender,
            _content,
            time,
            _isCensored,
            _imageURL
        );
        userPosts[msg.sender].push(post);
        posts[postId] = post;
        scores[msg.sender] += 10;

        //setting postCount mapping
        postCount[msg.sender].push(postId);
        numPosts++;
        emit NewPost(
            postId,
            msg.sender,
            _content,
            time,
            _isCensored,
            _imageURL
        );
    }

    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        bool timePassed = ((block.timestamp - lastTimestamp) > interval);

        address[] memory leaders = new address[](users.length); // initialising empty array.
        uint256[] memory leaderScores = new uint256[](users.length); // stores the score of the leaders.

        // Constructing the arrays leaders and leaderScores.
        for (uint256 i = 0; i < users.length; i++) {
            leaders[i] = users[i];
            leaderScores[i] = scores[users[i]];
        }

        // Bubble sort for sorting the leaders array based on leaderScores.
        for (uint256 i = 0; i < leaderScores.length; i++) {
            for (uint256 j = 0; j < leaderScores.length - 1; j++) {
                if (leaderScores[j] > leaderScores[j + 1]) {
                    uint256 temp = leaderScores[j];
                    leaderScores[j] = leaderScores[j + 1];
                    leaderScores[j + 1] = temp;

                    address temper = leaders[j];
                    leaders[j] = leaders[j + 1];
                    leaders[j + 1] = temper;
                }
            }
        }

        upkeepNeeded = timePassed;
        performData = abi.encode(leaders);

        return (upkeepNeeded, performData);
    }

    function performUpkeep(bytes calldata performData) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert SocialMedia__UpkeepNotNeeded();
        }

        leaderData = performData;

        // decode performData
        address[] memory leaders = abi.decode(performData, (address[]));

        // assign decoded data to the leaderboard.
        leaderboard = leaders;
    }

    // Gets score of a particular useraddress.
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

    function likePost(address _postAuthor, uint256 _postld)
        public
        checkPostId(_postAuthor, _postld)
    {
        if (likes[_postld][msg.sender]) {
            likes[_postld][msg.sender] = false;
            scores[_postAuthor] -= 5;
        } else {
            likes[_postld][msg.sender] = true;
            scores[_postAuthor] += 5;
        }
        emit NewLike(
            _postAuthor,
            msg.sender,
            _postld,
            likes[_postld][msg.sender],
            scores[_postAuthor]
        );
    }

    function commentOnPost(
        address _postAuthor,
        uint256 _postld,
        string memory _content
    ) public checkPostId(_postAuthor, _postld) {
        comments[_postld][msg.sender] = _content;
        scores[_postAuthor] += 10;
        emit NewComment(
            _postAuthor,
            msg.sender,
            _postld,
            _content,
            scores[_postAuthor]
        );
    }

    function deleteComment(address _postAuthor, uint256 _postId)
        public
        checkPostId(_postAuthor, _postId)
    {
        delete comments[_postId][msg.sender];
        scores[_postAuthor] -= 10;
        emit DeleteComment(
            _postAuthor,
            msg.sender,
            _postId,
            scores[_postAuthor]
        );
    }

    function deletePost(uint256 _postId)
        public
        checkPostId(msg.sender, _postId)
    {
        for (uint256 i = 0; i < userPosts[msg.sender].length; i++) {
            if (userPosts[msg.sender][i].id == _postId) {
                delete userPosts[msg.sender][i];
                break;
            }
        }
        delete posts[_postId];
        emit DeletePost(_postId, msg.sender);
    }

    function editPost(
        uint256 _postId,
        string memory _content,
        string memory _imageURL,
        bool _isCensored
    ) public checkPostId(msg.sender, _postId) {
        uint256 time = block.timestamp;
        for (uint256 i = 0; i < userPosts[msg.sender].length; i++) {
            if (userPosts[msg.sender][i].id == _postId) {
                userPosts[msg.sender][i].content = _content;
                userPosts[msg.sender][i].timestamp = time;
                userPosts[msg.sender][i].isCensored = _isCensored;
                userPosts[msg.sender][i].imageURL = _imageURL;
            }
        }
        posts[_postId].content = _content;
        posts[_postId].timestamp = time;
        posts[_postId].isCensored = _isCensored;
        posts[_postId].imageURL = _imageURL;
        emit EditPost(
            _postId,
            msg.sender,
            _content,
            time,
            _isCensored,
            _imageURL
        );
    }

    function getPosts() internal view returns (Post[] storage) {
        return userPosts[msg.sender];
    }

    function getPostById(uint256 _postId) public view returns (Post memory) {
        return posts[_postId];
    }

    function getPostCount(address user) public view returns (uint256) {
        return postCount[user].length;
    }

    function addModerator(address user) public onlyOwner {
        require(!isModerator[user], "User is already a moderator.");
        isModerator[user] = true;
    }

    function removeModerator(address user) public onlyOwner {
        require(isModerator[user], "User is not a moderator.");
        isModerator[user] = false;
    }

    function censorPost(address postAuthor, uint256 postld) public {
        //require(postld < postCount[postAuthor], "Invalid post ID.");
        require(
            !userPosts[postAuthor][postld].isCensored,
            "Post is already censored."
        );
        userPosts[postAuthor][postld].isCensored = true;
        emit CensoredPost(postAuthor, postld);
    }

    function uncensorPost(address postAuthor, uint256 postld) public {
        //require(postld < postCount[postAuthor], "Invalid post ID.");
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

    modifier checkPostId(address _postAuthor, uint256 _postld) {
        require(posts[_postld].author == _postAuthor, "Invaild post!!");
        _;
    }
}
