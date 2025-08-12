import express from 'express';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Mock rewards data (use database in production)
const rewardsStore = {
  categories: [
    {
      id: 'food_drinks',
      name: 'Food & Drinks',
      icon: '🍕',
      description: 'Restaurant vouchers, coffee credits, and meal deals'
    },
    {
      id: 'wellness',
      name: 'Wellness',
      icon: '🧘',
      description: 'Gym memberships, spa treatments, and wellness apps'
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      icon: '🎬',
      description: 'Movie tickets, streaming subscriptions, and event passes'
    },
    {
      id: 'tech',
      name: 'Tech & Gadgets',
      icon: '📱',
      description: 'Electronics, accessories, and digital tools'
    },
    {
      id: 'experiences',
      name: 'Experiences',
      icon: '🎨',
      description: 'Classes, workshops, and unique experiences'
    }
  ],
  
  items: [
    // Food & Drinks
    {
      id: 'coffee_credit_5',
      name: '$5 Coffee Credit',
      description: 'Redeem at any participating coffee shop',
      category: 'food_drinks',
      points: 100,
      regions: ['US', 'CA', 'UK', 'AU'],
      image: '/images/rewards/coffee.jpg',
      brand: 'Local Coffee Partners',
      availability: 'unlimited'
    },
    {
      id: 'lunch_voucher_15',
      name: '$15 Lunch Voucher',
      description: 'Valid at 500+ restaurants nationwide',
      category: 'food_drinks',
      points: 300,
      regions: ['US', 'CA'],
      image: '/images/rewards/lunch.jpg',
      brand: 'FoodDelivery Plus',
      availability: 'unlimited'
    },
    
    // Wellness
    {
      id: 'meditation_app',
      name: '3-Month Meditation App',
      description: 'Premium subscription to leading meditation platform',
      category: 'wellness',
      points: 500,
      regions: ['global'],
      image: '/images/rewards/meditation.jpg',
      brand: 'MindfulnessApp',
      availability: 'unlimited'
    },
    {
      id: 'gym_day_pass',
      name: 'Gym Day Pass',
      description: 'Access to premium fitness facilities',
      category: 'wellness',
      points: 200,
      regions: ['US', 'UK', 'AU'],
      image: '/images/rewards/gym.jpg',
      brand: 'FitLife Gyms',
      availability: 'limited'
    },
    
    // Entertainment
    {
      id: 'movie_tickets',
      name: '2 Movie Tickets',
      description: 'Valid at any participating theater',
      category: 'entertainment',
      points: 400,
      regions: ['US', 'CA', 'UK'],
      image: '/images/rewards/movie.jpg',
      brand: 'CinemaChain',
      availability: 'unlimited'
    },
    {
      id: 'streaming_month',
      name: '1 Month Streaming',
      description: 'Access to premium streaming service',
      category: 'entertainment',
      points: 250,
      regions: ['global'],
      image: '/images/rewards/streaming.jpg',
      brand: 'StreamingPlatform',
      availability: 'unlimited'
    },
    
    // Tech & Gadgets
    {
      id: 'wireless_earbuds',
      name: 'Wireless Earbuds',
      description: 'High-quality bluetooth earbuds',
      category: 'tech',
      points: 1500,
      regions: ['global'],
      image: '/images/rewards/earbuds.jpg',
      brand: 'TechBrand',
      availability: 'limited'
    },
    {
      id: 'phone_charger',
      name: 'Wireless Phone Charger',
      description: 'Fast charging wireless pad',
      category: 'tech',
      points: 800,
      regions: ['global'],
      image: '/images/rewards/charger.jpg',
      brand: 'TechBrand',
      availability: 'unlimited'
    },
    
    // Experiences
    {
      id: 'cooking_class',
      name: 'Online Cooking Class',
      description: 'Learn from professional chefs',
      category: 'experiences',
      points: 600,
      regions: ['global'],
      image: '/images/rewards/cooking.jpg',
      brand: 'CulinaryAcademy',
      availability: 'unlimited'
    },
    {
      id: 'art_workshop',
      name: 'Virtual Art Workshop',
      description: '2-hour guided art session',
      category: 'experiences',
      points: 450,
      regions: ['global'],
      image: '/images/rewards/art.jpg',
      brand: 'CreativeStudio',
      availability: 'unlimited'
    }
  ]
};

// Mock user points (use database in production)
const userPoints = new Map();

/**
 * @route GET /api/rewards
 * @desc Get all available rewards
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const { category, region, maxPoints } = req.query;
    
    let filteredItems = [...rewardsStore.items];
    
    // Filter by category
    if (category) {
      filteredItems = filteredItems.filter(item => 
        item.category === category
      );
    }
    
    // Filter by region
    if (region) {
      filteredItems = filteredItems.filter(item => 
        item.regions.includes('global') || item.regions.includes(region)
      );
    }
    
    // Filter by max points
    if (maxPoints) {
      filteredItems = filteredItems.filter(item => 
        item.points <= parseInt(maxPoints)
      );
    }
    
    res.json({
      success: true,
      categories: rewardsStore.categories,
      items: filteredItems,
      total: filteredItems.length
    });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rewards'
    });
  }
});

/**
 * @route GET /api/rewards/categories
 * @desc Get reward categories
 * @access Public
 */
router.get('/categories', async (req, res) => {
  try {
    res.json({
      success: true,
      categories: rewardsStore.categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

/**
 * @route GET /api/rewards/balance
 * @desc Get user's points balance
 * @access Private
 */
router.get('/balance', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const balance = userPoints.get(userId) || 0;
    
    res.json({
      success: true,
      balance,
      userId
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch points balance'
    });
  }
});

/**
 * @route POST /api/rewards/redeem
 * @desc Redeem a reward
 * @access Private
 */
router.post('/redeem', authenticateUser, async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.user.uid;
    
    if (!itemId) {
      return res.status(400).json({
        success: false,
        error: 'Item ID is required'
      });
    }
    
    // Find the reward item
    const item = rewardsStore.items.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Reward item not found'
      });
    }
    
    // Check user's points balance
    const currentBalance = userPoints.get(userId) || 0;
    if (currentBalance < item.points) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient points',
        required: item.points,
        current: currentBalance
      });
    }
    
    // Deduct points
    userPoints.set(userId, currentBalance - item.points);
    
    // Create redemption record
    const redemption = {
      id: `redemption_${Date.now()}`,
      userId,
      itemId,
      itemName: item.name,
      pointsUsed: item.points,
      redeemedAt: new Date().toISOString(),
      status: 'pending', // pending, confirmed, delivered, failed
      deliveryMethod: getDeliveryMethod(item),
      estimatedDelivery: getEstimatedDelivery(item)
    };
    
    res.json({
      success: true,
      redemption,
      newBalance: userPoints.get(userId)
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to redeem reward'
    });
  }
});

/**
 * @route POST /api/rewards/points/add
 * @desc Add points to user (called after game completion)
 * @access Private
 */
router.post('/points/add', authenticateUser, async (req, res) => {
  try {
    const { points, reason, sessionId } = req.body;
    const userId = req.user.uid;
    
    if (!points || points <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid points amount is required'
      });
    }
    
    const currentBalance = userPoints.get(userId) || 0;
    const newBalance = currentBalance + points;
    userPoints.set(userId, newBalance);
    
    // Log the points transaction
    const transaction = {
      id: `txn_${Date.now()}`,
      userId,
      type: 'earned',
      points,
      reason: reason || 'Game participation',
      sessionId,
      timestamp: new Date().toISOString(),
      balanceAfter: newBalance
    };
    
    res.json({
      success: true,
      transaction,
      newBalance
    });
  } catch (error) {
    console.error('Error adding points:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add points'
    });
  }
});

/**
 * @route GET /api/rewards/history
 * @desc Get user's redemption history
 * @access Private
 */
router.get('/history', authenticateUser, async (req, res) => {
  try {
    // In production, this would query the database
    // For now, return mock data
    const history = [
      {
        id: 'redemption_1',
        itemName: '$5 Coffee Credit',
        pointsUsed: 100,
        redeemedAt: '2024-01-15T10:30:00Z',
        status: 'delivered'
      },
      {
        id: 'redemption_2',
        itemName: 'Movie Tickets',
        pointsUsed: 400,
        redeemedAt: '2024-01-10T15:20:00Z',
        status: 'confirmed'
      }
    ];
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch redemption history'
    });
  }
});

/**
 * Helper function to determine delivery method
 */
function getDeliveryMethod(item) {
  const digitalCategories = ['entertainment', 'wellness'];
  return digitalCategories.includes(item.category) ? 'digital' : 'physical';
}

/**
 * Helper function to estimate delivery time
 */
function getEstimatedDelivery(item) {
  const deliveryMethod = getDeliveryMethod(item);
  
  if (deliveryMethod === 'digital') {
    return 'Instant - Check your email';
  }
  
  if (item.category === 'food_drinks') {
    return '24-48 hours via email';
  }
  
  return '5-7 business days';
}

export { userPoints };
export default router;
