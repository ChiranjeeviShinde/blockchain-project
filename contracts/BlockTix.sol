// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BlockTix - Blockchain-Based Event Ticketing and Verification System
 * @notice Decentralized, ERC-721 NFT-compatible event ticketing smart contract.
 *         Supports event creation, tamper-proof ticket purchasing, transparent ownership transfers,
 *         and gate entry validation with replay prevention.
 *
 * @dev Key Security Features:
 *      1. Anti-Scalping / Anti-Replay: Once a ticket is marked USED at gate entry,
 *         it is permanently locked and cannot be transferred or reused.
 *      2. Role-Based Verification: Only the designated event organizer, contract owner,
 *         or authorized verifier addresses can approve entry.
 *      3. Supply Caps: Tickets can never be minted beyond the event's maxSupply.
 *      4. ReentrancyGuard: Protects payable functions from reentrancy attacks.
 *
 * NOTE FOR COLLEGE PROJECT / ACADEMIC REVIEW:
 * While smart contracts ensure cryptographically verifiable ownership, immutable transaction logs,
 * and deterministic state transitions, they do not eliminate all off-chain vulnerabilities
 * (such as physical screen capture sharing without rotating dynamic QR codes, or off-chain phishing).
 */
contract BlockTix is ERC721, Ownable, ReentrancyGuard {

    // --- Data Structures ---

    struct EventDetails {
        uint256 id;
        string title;
        string category;
        string venue;
        uint256 eventTimestamp; // Unix timestamp
        uint256 ticketPrice;    // Price in wei
        uint256 maxSupply;      // Total capacity
        uint256 soldTickets;    // Number of minted tickets
        address payable organizer;
        bool isActive;
        string imageUri;
        string description;
    }

    struct Ticket {
        uint256 tokenId;
        uint256 eventId;
        address originalMinter;
        uint256 pricePaid;      // in wei
        uint256 purchaseTime;   // Unix timestamp
        bool isUsed;            // Gate verification status
        uint256 usedAt;         // Timestamp when redeemed
        address usedByVerifier; // Verifier address who admitted attendee
        string tier;            // e.g., "General Admission", "VIP Pass"
    }

    // --- State Variables ---

    uint256 private _tokenCounter;
    uint256 private _eventCounter;

    // eventId => EventDetails
    mapping(uint256 => EventDetails) public events;

    // tokenId => Ticket
    mapping(uint256 => Ticket) public tickets;

    // eventId => verifier address => isAuthorized
    mapping(uint256 => mapping(address => bool)) public authorizedVerifiers;

    // eventId => accumulated withdrawn revenue
    mapping(uint256 => uint256) public eventWithdrawnRevenue;

    // user address => array of tokenIds owned
    mapping(address => uint256[]) private _userOwnedTokens;

    // List of all created event IDs for easy catalog retrieval
    uint256[] public allEventIds;

    // --- Events ---

    event EventCreated(
        uint256 indexed eventId,
        string title,
        address indexed organizer,
        uint256 ticketPrice,
        uint256 maxSupply,
        uint256 eventTimestamp
    );

    event TicketPurchased(
        uint256 indexed tokenId,
        uint256 indexed eventId,
        address indexed buyer,
        uint256 pricePaid,
        string tier
    );

    event TicketTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    event TicketUsed(
        uint256 indexed tokenId,
        uint256 indexed eventId,
        address indexed verifier,
        uint256 usedAt
    );

    event VerifierUpdated(
        uint256 indexed eventId,
        address indexed verifier,
        bool authorized
    );

    event EventFundsWithdrawn(
        uint256 indexed eventId,
        address indexed organizer,
        uint256 amount
    );

    // --- Constructor ---

    constructor() ERC721("BlockTix Event Pass", "BTIX") Ownable(msg.sender) {
        // Seed initial events for immediate demonstration on Sepolia or local testnets
        _createInitialEvent(
            "Blockchain Tech Summit 2026",
            "Technology",
            "Convention Center, Silicon Valley Tech Park, Bengaluru",
            block.timestamp + 30 days,
            0.0001 ether, // Low testnet price for accessible Sepolia testing
            100,
            "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
            "The premier conference on Layer-2 scalability, zero-knowledge proofs, and decentralized applications."
        );

        _createInitialEvent(
            "Campus Innovation Expo & Hackathon",
            "Campus & Academia",
            "Main Auditorium, CSE Department, Campus Block-3",
            block.timestamp + 14 days,
            0.00005 ether,
            150,
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
            "Annual CSE innovation showcase where student teams present blockchain and AI capstone projects."
        );
    }

    // --- Event Management Functions ---

    /**
     * @notice Create a new event on the blockchain with supply cap and ticket pricing.
     * @param title Title of the event
     * @param category Event category (e.g. Technology, Music, Academic)
     * @param venue Physical or virtual venue location
     * @param eventTimestamp Unix timestamp of event execution
     * @param ticketPrice Price per ticket in wei (0 for free events)
     * @param maxSupply Total ticket capacity
     * @param imageUri Media cover URL or IPFS hash
     * @param description Brief event description
     */
    function createEvent(
        string memory title,
        string memory category,
        string memory venue,
        uint256 eventTimestamp,
        uint256 ticketPrice,
        uint256 maxSupply,
        string memory imageUri,
        string memory description
    ) external returns (uint256) {
        require(bytes(title).length > 0, "BlockTix: Event title cannot be empty");
        require(maxSupply > 0, "BlockTix: Max supply must be greater than zero");
        require(eventTimestamp > block.timestamp, "BlockTix: Event date must be in the future");

        _eventCounter++;
        uint256 newEventId = _eventCounter;

        events[newEventId] = EventDetails({
            id: newEventId,
            title: title,
            category: category,
            venue: venue,
            eventTimestamp: eventTimestamp,
            ticketPrice: ticketPrice,
            maxSupply: maxSupply,
            soldTickets: 0,
            organizer: payable(msg.sender),
            isActive: true,
            imageUri: imageUri,
            description: description
        });

        allEventIds.push(newEventId);

        // By default, the organizer is authorized to verify tickets for their event
        authorizedVerifiers[newEventId][msg.sender] = true;

        emit EventCreated(
            newEventId,
            title,
            msg.sender,
            ticketPrice,
            maxSupply,
            eventTimestamp
        );

        return newEventId;
    }

    /**
     * @dev Internal helper to seed initial demonstration events
     */
    function _createInitialEvent(
        string memory title,
        string memory category,
        string memory venue,
        uint256 eventTimestamp,
        uint256 ticketPrice,
        uint256 maxSupply,
        string memory imageUri,
        string memory description
    ) internal {
        _eventCounter++;
        uint256 newEventId = _eventCounter;

        events[newEventId] = EventDetails({
            id: newEventId,
            title: title,
            category: category,
            venue: venue,
            eventTimestamp: eventTimestamp,
            ticketPrice: ticketPrice,
            maxSupply: maxSupply,
            soldTickets: 0,
            organizer: payable(msg.sender),
            isActive: true,
            imageUri: imageUri,
            description: description
        });

        allEventIds.push(newEventId);
        authorizedVerifiers[newEventId][msg.sender] = true;
    }

    // --- Ticket Minting / Purchase ---

    /**
     * @notice Mint a unique ERC-721 NFT ticket to the purchaser's wallet.
     * @param eventId The ID of the event to purchase a ticket for
     * @param tier Ticket tier classification (e.g., "General Admission")
     */
    function purchaseTicket(uint256 eventId, string memory tier)
        external
        payable
        nonReentrant
        returns (uint256)
    {
        EventDetails storage evt = events[eventId];
        require(evt.id != 0, "BlockTix: Event does not exist");
        require(evt.isActive, "BlockTix: Event is not currently active");
        require(evt.soldTickets < evt.maxSupply, "BlockTix: Event sold out");
        require(msg.value >= evt.ticketPrice, "BlockTix: Insufficient payment value sent");

        _tokenCounter++;
        uint256 newTokenId = _tokenCounter;

        evt.soldTickets++;

        // Store ticket state
        tickets[newTokenId] = Ticket({
            tokenId: newTokenId,
            eventId: eventId,
            originalMinter: msg.sender,
            pricePaid: evt.ticketPrice,
            purchaseTime: block.timestamp,
            isUsed: false,
            usedAt: 0,
            usedByVerifier: address(0),
            tier: bytes(tier).length > 0 ? tier : "General Admission"
        });

        // Mint ERC-721 token to buyer
        _safeMint(msg.sender, newTokenId);

        // Refund excess payment if sender sent more ETH than required
        if (msg.value > evt.ticketPrice) {
            uint256 refundAmount = msg.value - evt.ticketPrice;
            (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
            require(success, "BlockTix: Refund failed");
        }

        emit TicketPurchased(newTokenId, eventId, msg.sender, evt.ticketPrice, tier);

        return newTokenId;
    }

    // --- Ticket Transfer Logic & Anti-Scalping Protection ---

    /**
     * @notice Transfer ticket custody to another Ethereum address.
     * @param to Recipient wallet address
     * @param tokenId NFT Token ID to transfer
     */
    function transferTicket(address to, uint256 tokenId) external nonReentrant {
        require(to != address(0), "BlockTix: Cannot transfer to zero address");
        require(to != msg.sender, "BlockTix: Cannot transfer to yourself");
        require(ownerOf(tokenId) == msg.sender, "BlockTix: Caller is not the current ticket owner");
        require(!tickets[tokenId].isUsed, "BlockTix: Cannot transfer an already redeemed/used ticket");

        safeTransferFrom(msg.sender, to, tokenId);

        emit TicketTransferred(tokenId, msg.sender, to, block.timestamp);
    }

    /**
     * @notice OpenZeppelin v5 internal hook triggered on all mints, burns, and transfers.
     *         Enforces that tickets marked as USED cannot be moved on-chain.
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);

        // If this is a secondary transfer (neither mint nor burn), reject if already redeemed
        if (from != address(0) && to != address(0)) {
            require(!tickets[tokenId].isUsed, "BlockTix: Ticket has already been used and cannot be transferred");
        }

        address previousOwner = super._update(to, tokenId, auth);

        // Maintain index of tokens owned by addresses for fast UI queries
        if (from != address(0)) {
            _removeTokenFromOwnerList(from, tokenId);
        }
        if (to != address(0)) {
            _userOwnedTokens[to].push(tokenId);
        }

        return previousOwner;
    }

    function _removeTokenFromOwnerList(address from, uint256 tokenId) private {
        uint256[] storage tokenList = _userOwnedTokens[from];
        uint256 length = tokenList.length;
        for (uint256 i = 0; i < length; i++) {
            if (tokenList[i] == tokenId) {
                tokenList[i] = tokenList[length - 1];
                tokenList.pop();
                break;
            }
        }
    }

    // --- Gate Entry Verification & Anti-Replay Protection ---

    /**
     * @notice View function to verify ticket authenticity, ownership, and redemption state.
     * @param tokenId The NFT token ID to check
     */
    function verifyTicket(uint256 tokenId) external view returns (
        bool exists,
        bool isValid,
        bool isUsed,
        uint256 eventId,
        string memory eventTitle,
        address currentOwner,
        address originalMinter,
        uint256 eventTimestamp,
        string memory venue,
        string memory tier
    ) {
        if (_ownerOf(tokenId) == address(0)) {
            return (false, false, false, 0, "", address(0), address(0), 0, "", "");
        }

        Ticket memory t = tickets[tokenId];
        EventDetails memory e = events[t.eventId];

        exists = true;
        isValid = e.isActive && !t.isUsed;
        isUsed = t.isUsed;
        eventId = t.eventId;
        eventTitle = e.title;
        currentOwner = ownerOf(tokenId);
        originalMinter = t.originalMinter;
        eventTimestamp = e.eventTimestamp;
        venue = e.venue;
        tier = t.tier;
    }

    /**
     * @notice Redeem a ticket at the gate. Permanently sets isUsed to true.
     *         Only authorized gate personnel or the event organizer can call this.
     * @param tokenId The NFT ticket ID being scanned
     */
    function useTicket(uint256 tokenId) external nonReentrant {
        require(_ownerOf(tokenId) != address(0), "BlockTix: Ticket does not exist");

        Ticket storage ticket = tickets[tokenId];
        require(!ticket.isUsed, "BlockTix: ENTRY DENIED - Ticket has already been used and redeemed");

        EventDetails storage evt = events[ticket.eventId];
        require(evt.isActive, "BlockTix: Event is not active");

        bool isAuthorized = (
            msg.sender == evt.organizer ||
            msg.sender == owner() ||
            authorizedVerifiers[ticket.eventId][msg.sender]
        );
        require(isAuthorized, "BlockTix: Unauthorized - Caller is not an authorized verifier for this event");

        ticket.isUsed = true;
        ticket.usedAt = block.timestamp;
        ticket.usedByVerifier = msg.sender;

        emit TicketUsed(tokenId, ticket.eventId, msg.sender, block.timestamp);
    }

    // --- Verifier & Organizer Authorization ---

    /**
     * @notice Authorize or revoke a wallet address as a designated gate scanner/verifier.
     * @param eventId The event ID
     * @param verifier The address to authorize/revoke
     * @param authorized True to authorize, false to revoke
     */
    function setVerifier(uint256 eventId, address verifier, bool authorized) external {
        EventDetails storage evt = events[eventId];
        require(evt.id != 0, "BlockTix: Event does not exist");
        require(
            msg.sender == evt.organizer || msg.sender == owner(),
            "BlockTix: Only event organizer or contract owner can manage verifiers"
        );
        require(verifier != address(0), "BlockTix: Invalid verifier address");

        authorizedVerifiers[eventId][verifier] = authorized;
        emit VerifierUpdated(eventId, verifier, authorized);
    }

    /**
     * @notice Allows an event organizer to withdraw ticket sale revenue for their event.
     * @param eventId The event ID
     */
    function withdrawEventFunds(uint256 eventId) external nonReentrant {
        EventDetails storage evt = events[eventId];
        require(evt.id != 0, "BlockTix: Event does not exist");
        require(
            msg.sender == evt.organizer || msg.sender == owner(),
            "BlockTix: Caller is not the event organizer"
        );

        uint256 totalRevenue = evt.soldTickets * evt.ticketPrice;
        uint256 alreadyWithdrawn = eventWithdrawnRevenue[eventId];
        require(totalRevenue > alreadyWithdrawn, "BlockTix: No remaining funds to withdraw");

        uint256 amountToWithdraw = totalRevenue - alreadyWithdrawn;
        require(address(this).balance >= amountToWithdraw, "BlockTix: Insufficient contract balance");

        eventWithdrawnRevenue[eventId] += amountToWithdraw;
        (bool success, ) = evt.organizer.call{value: amountToWithdraw}("");
        require(success, "BlockTix: Withdrawal transfer failed");

        emit EventFundsWithdrawn(eventId, evt.organizer, amountToWithdraw);
    }

    // --- Query & Helper Methods ---

    /**
     * @notice Returns array of all active and past events on-chain
     */
    function getAllEvents() external view returns (EventDetails[] memory) {
        EventDetails[] memory allEvents = new EventDetails[](allEventIds.length);
        for (uint256 i = 0; i < allEventIds.length; i++) {
            allEvents[i] = events[allEventIds[i]];
        }
        return allEvents;
    }

    /**
     * @notice Returns single event by ID
     */
    function getEvent(uint256 eventId) external view returns (EventDetails memory) {
        require(events[eventId].id != 0, "BlockTix: Event does not exist");
        return events[eventId];
    }

    /**
     * @notice Returns all tickets currently owned by a given wallet address
     */
    function getUserTickets(address user) external view returns (Ticket[] memory) {
        uint256[] memory tokenIds = _userOwnedTokens[user];
        Ticket[] memory userTickets = new Ticket[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            userTickets[i] = tickets[tokenIds[i]];
        }
        return userTickets;
    }

    /**
     * @notice Returns the total number of events created
     */
    function getTotalEvents() external view returns (uint256) {
        return allEventIds.length;
    }

    /**
     * @notice Returns total minted tickets count
     */
    function getTotalTicketsMinted() external view returns (uint256) {
        return _tokenCounter;
    }

    /**
     * @notice ERC-165 support
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
