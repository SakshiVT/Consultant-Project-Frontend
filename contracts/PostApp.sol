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
        uint256 banCounter;
        bool isCensored;
        string imageURL;
        address[] likeAddress;
        address[] commentAddress;
        string[] comment;
    }

    mapping(uint256 => mapping(address => bool)) public likes; //to maintain likes of all posts

    address[] public users; // this array to be updated with the sign-up / sign-in feature.
    address[] public leaderboard; // this array to be updated by sorting the users by their scores.

    uint256 public numPosts; // number of posts on the deso.
    mapping(uint256 => Post) public posts; // stores all posts on the deso.

    mapping(address => Post[]) public userPosts; // stores all posts on the deso by a particular user.
    mapping(address => uint256[]) public postCount; // stores the no. of posts on the deso by a particular user.

    uint256 public immutable interval; // time after which the leaderboard needs to be reset.
    uint256 public lastTimestamp; // the last timestamp at which the leaderboard was reset.

    mapping(address => uint256) public scores; // stores the scores of all users.

    address public owner; // stores the address of the owner of this contract.

    bytes public leaderData;

    // variables for scores
    uint256 public newPostScore = 10;
    uint256 public newLikeScore = 5;
    uint256 public newCommentScore = 10;
    uint256 public moderatorThreshold = 20;
    uint256 public banUser = 2;

    event NewPost(
        uint256 postId,
        address author,
        string content,
        uint256 timestamp,
        uint256 banCounter,
        bool isCensored,
        string imageURL,
        uint256 score
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
    event DeletePost(
        uint256 postId, 
        address postAuthor, 
        uint256 authorScore
    );
    event EditPost(
        uint256 postId,
        address author,
        string content,
        uint256 timestamp,
        string imageURL
    );

    event CensoredPost(
        address moderator, 
        address postAuthor, 
        uint256 postld, 
        uint256 banCounter, 
        bool isCensored
    );
    event UncensoredPost(
        address moderator, 
        address postAuthor, 
        uint256 postld, 
        uint256 banCounter, 
        bool isCensored
    );

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
        string memory _imageURL
    ) public {
        uint256 time = block.timestamp;
        uint256 postId = numPosts;
        bool _isCensored = false;
        Post memory post = Post(
            postId,
            msg.sender,
            _content,
            time,
            0,
            _isCensored,
            _imageURL,
            new address[](0),
            new address[](0),
            new string[](0)
        );
        userPosts[msg.sender].push(post);
        posts[postId] = post;
        scores[msg.sender] += newPostScore;

        //setting postCount mapping
        postCount[msg.sender].push(postId);
        numPosts++;
        emit NewPost(
            postId,
            msg.sender,
            _content,
            time,
            0,
            _isCensored,
            _imageURL,
            scores[msg.sender]
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

    function likePost(address _postAuthor, uint256 _postId)
        public
        checkPostId(_postAuthor, _postId)
    {
        if (likes[_postId][msg.sender]) {
            likes[_postId][msg.sender] = false;
            for(uint i=0; i<posts[_postId].likeAddress.length ; i++){
                if(posts[_postId].likeAddress[i] == msg.sender){
                    delete posts[_postId].likeAddress[i];
                    break;
                }
            }
            for(uint i = 0; i< userPosts[_postAuthor].length; i++){
                for(uint j = 0; j< userPosts[_postAuthor][i].likeAddress.length;j++){
                    if(userPosts[_postAuthor][i].likeAddress[j] == msg.sender){
                        delete userPosts[_postAuthor][i].likeAddress[j];
                        break;
                    }
                }               
            }
            scores[_postAuthor] -= newLikeScore;
        } else {
            likes[_postId][msg.sender] = true;            
            posts[_postId].likeAddress.push(msg.sender);
            scores[_postAuthor] += newLikeScore;
            for(uint i = 0; i< userPosts[_postAuthor].length; i++){
                if(userPosts[_postAuthor][i].id == _postId){
                    userPosts[_postAuthor][i].likeAddress.push(msg.sender);
                    break;
                }
            }
        }
        emit NewLike(
            _postAuthor,
            msg.sender,
            _postId,
            likes[_postId][msg.sender],
            scores[_postAuthor]
        );
    }

    function commentOnPost(
        address _postAuthor,
        uint256 _postId,
        string memory _content
    ) public checkPostId(_postAuthor, _postId) {
        for(uint i = 0; i< userPosts[_postAuthor].length; i++){
            if(userPosts[_postAuthor][i].id == _postId){
                userPosts[_postAuthor][i].commentAddress.push(msg.sender);
                userPosts[_postAuthor][i].comment.push(_content);
                break;
            }
        }
        posts[_postId].commentAddress.push(msg.sender);
        posts[_postId].comment.push(_content);
        scores[_postAuthor] += newCommentScore;
        
        emit NewComment(
            _postAuthor,
            msg.sender,
            _postId,
            _content,
            scores[_postAuthor]
        );
    }

    function deleteComment(address _postAuthor, uint256 _postId)
        public
        checkPostId(_postAuthor, _postId)
    {
        scores[_postAuthor] -= newCommentScore;
        for(uint i=0; i<posts[_postId].commentAddress.length ; i++){
            if(posts[_postId].commentAddress[i] == msg.sender){
                delete posts[_postId].commentAddress[i];
                delete posts[_postId].comment[i];
                break;
            }
        }

        for(uint i = 0; i< userPosts[_postAuthor].length; i++){
            for(uint j = 0; j< userPosts[_postAuthor][i].commentAddress.length;j++){
                if(userPosts[_postAuthor][i].commentAddress[j] == msg.sender){
                    delete userPosts[_postAuthor][i].commentAddress[j];
                    delete userPosts[_postAuthor][i].comment[j];
                    break;
                }
            }
        }

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
        for (uint i = 0; i < userPosts[msg.sender].length; i++) {
            if (userPosts[msg.sender][i].id == _postId) {
                delete userPosts[msg.sender][i];
                break;
            }
        }
        scores[msg.sender] -= newPostScore;
        delete posts[_postId];
        emit DeletePost(_postId, msg.sender, scores[msg.sender]);
    }

    function editPost(
        uint256 _postId,
        string memory _content,
        string memory _imageURL
    ) public checkPostId(msg.sender, _postId) {
        uint256 time = block.timestamp;
        for (uint256 i = 0; i < userPosts[msg.sender].length; i++) {
            if (userPosts[msg.sender][i].id == _postId) {
                userPosts[msg.sender][i].content = _content;
                userPosts[msg.sender][i].timestamp = time;
                userPosts[msg.sender][i].imageURL = _imageURL;
            }
        }
        posts[_postId].content = _content;
        posts[_postId].timestamp = time;
        posts[_postId].imageURL = _imageURL;
        emit EditPost(
            _postId,
            msg.sender,
            _content,
            time,
            _imageURL
        );
    }

    function getAllPosts() public view returns(Post[] memory){
        Post[] memory p = new Post[](numPosts);
        // address[][] memory add = new address[][];
        for(uint i=0 ; i<numPosts;i++){
            p[i].id = posts[i].id;
            p[i].author = posts[i].author;
            p[i].content = posts[i].content;
            p[i].timestamp = posts[i].timestamp;
            p[i].banCounter = posts[i].banCounter;
            p[i].isCensored = posts[i].isCensored;
            p[i].imageURL = posts[i].imageURL;
            p[i].likeAddress = posts[i].likeAddress;
            p[i].commentAddress =posts[i].commentAddress;
            p[i].comment =posts[i].comment;
        }
        return p;
        
    }

    function getPostsByUser() internal view returns (Post[] storage) {
        return userPosts[msg.sender];
    }

    function getPostById(uint256 _postId) public view returns (Post memory, address[] memory, uint256 id, address[] memory, string[] memory) {
        return (posts[_postId], posts[_postId].likeAddress, posts[_postId].id, posts[_postId].commentAddress, posts[_postId].comment);
    }

    function getPostCount(address user) public view returns (uint256) {
        return postCount[user].length;
    }

    function censorPost(address postAuthor, uint256 postId) public onlyModerator{
        require(
            !posts[postId].isCensored,
            "Post is already censored."
        );
        posts[postId].banCounter++;
        for(uint i=0; i<userPosts[postAuthor].length; i++){
            if(userPosts[postAuthor][i].id == postId){
                userPosts[postAuthor][i].banCounter++;
            }
            if(posts[postId].banCounter > banUser){
                userPosts[postAuthor][i].isCensored = true;
                posts[postId].isCensored = true;
            }
        }
        emit CensoredPost(msg.sender, postAuthor, postId, posts[postId].banCounter, posts[postId].isCensored);
    }

    function uncensorPost(address postAuthor, uint256 postId) public onlyModerator{
        require(
            posts[postId].isCensored,
            "Post is not censored."
        );
        posts[postId].banCounter--;
        for(uint i=0; i<userPosts[postAuthor].length; i++){
            if(userPosts[postAuthor][i].id == postId){
                userPosts[postAuthor][i].banCounter--;
            }
            if(posts[postId].banCounter <= banUser){
                userPosts[postAuthor][i].isCensored = false;
                posts[postId].isCensored = false;
            }
        }
        emit UncensoredPost(msg.sender, postAuthor, postId,  posts[postId].banCounter, posts[postId].isCensored);
    }

    // access control
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    modifier onlyModerator() {
        require(
            scores[msg.sender] >= moderatorThreshold,
            "Only moderators can perform this action."
        );
        _;
    }

    modifier checkPostId(address _postAuthor, uint256 _postId) {
        require(posts[_postId].author == _postAuthor, "Invaild post!!");
        _;
    }
}
