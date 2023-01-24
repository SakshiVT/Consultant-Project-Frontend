// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract SocialMedia {

    struct Post {
        uint id;
        address author;
        string content;
        uint timestamp;
        // mapping (address => bool) likes;
        // mapping (address => string) comments;
        bool isCensored;
        string imageURL;
    }

    mapping (uint => mapping (address => uint)) public likes;
    mapping (uint => mapping (address => string)) public comments;

    uint256 public numPosts; // number of posts on the deso.
    mapping(uint256 => Post) public posts; // storse all posts on the deso.
    mapping (address => Post[]) public userPosts; // stores all posts on the deso by a particular user.
    mapping (address => uint) public postCount; // stores the no. of posts on the deso by a particular user.
    mapping (address => bool) public isModerator; // stores whether a particular address is a moderator or not.
    address public owner; // stores the address of the owner of this contract.
    uint idCount;

    event NewPost(address author, string content, uint timestamp);
    event NewLike(address postAuthor, address liker);
    event NewComment(address postAuthor, address commenter, string content);
    event CensoredPost(address bostAuthor, uint postld);
    event UncensoredPost(address postAuthor, uint postld);
    
    constructor() {
        owner = msg.sender;
    }

    function createPost(string memory _content,string memory _imageURL) public {
        Post memory post = Post(idCount, msg.sender, _content, block.timestamp, false, _imageURL);

        userPosts[msg.sender].push(post);

        //setting postCount mapping
        numPosts++;
        postCount[msg.sender]++;
        idCount++;

        emit NewPost(msg.sender, _content, block.timestamp);
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

    function getPostCount(address user) public view returns (uint) {
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
    
    function censorPost(address postAuthor, uint postld) public onlyModerator {
        require(postld < postCount[postAuthor], "Invalid post ID.");
        require(!userPosts[postAuthor][postld].isCensored, "Post is already censored.");
        userPosts [postAuthor][postld].isCensored = true;
        emit CensoredPost(postAuthor, postld);
    }

    function uncensorPost(address postAuthor, uint postld) public
    onlyModerator {
        require(postld < postCount[postAuthor], "Invalid post ID.");
        require(userPosts[postAuthor][postld].isCensored, "Post is not censored.");
        userPosts [postAuthor][postld].isCensored = false;
        emit UncensoredPost(postAuthor, postld);
    }
    // access control
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    modifier onlyModerator() {
        require(isModerator[msg.sender], "Only moderators can perform this action.");
        _;
    }


}
