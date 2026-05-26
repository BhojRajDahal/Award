import { createPrize, deletePrize, getAllPrizes, getPrizesCount, updatePrize, updatePrizeStatus } from '../model/prizeModel.js';

export const createPrizeController = async (req, res) => {
  try {
    const { title, description, open_date, close_date, is_active } = req.body;

    if (!title || !open_date || !close_date) {
      return res
        .status(400)
        .json({ msg: 'Title, open_date and close_date are required' });
    }

    const prize = await createPrize(
      title,
      description || null,
      open_date,
      close_date,
      typeof is_active === 'boolean' ? is_active : true,
    );

    return res.status(201).json({
      msg: 'Prize created successfully',
      prize: prize,
    });
  } catch (error) {
    console.error('Error creating prize:', error);
    return res
      .status(500)
      .json({ msg: error.message || 'Failed to create prize' });
  }
};

export const getPrizesController = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const offset = (page - 1) * limit;
    const [items, totalItems] = await Promise.all([
      getAllPrizes({ limit, offset }),
      getPrizesCount(),
    ]);
    return res.status(200).json({
      items,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching prizes:', error);
    return res
      .status(500)
      .json({ msg: error.message || 'Failed to fetch prizes' });
  }
};

export const updatePrizeStatusController = async (req, res) => {
  try {
    const { prizeId } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ msg: 'is_active must be boolean' });
    }

    const updated = await updatePrizeStatus(prizeId, is_active);

    if (!updated) {
      return res.status(404).json({ msg: 'Prize not found' });
    }

    return res.status(200).json({
      msg: 'Prize status updated successfully',
      prize: updated,
    });
  } catch (error) {
    console.error('Error updating prize status:', error);
    return res
      .status(500)
      .json({ msg: error.message || 'Failed to update prize status' });
  }
};

export const deletePrizeController = async (req, res) => {
  try {
    const { prizeId } = req.params;
    const deleted = await deletePrize(prizeId);

    if (!deleted) {
      return res.status(404).json({ msg: 'Prize not found' });
    }

    return res.status(200).json({ msg: 'Prize archived (deleted) successfully' });
  } catch (error) {
    console.error('Error deleting prize:', error);
    return res
      .status(500)
      .json({ msg: error.message || 'Failed to delete prize' });
  }
};

export const updatePrizeController = async (req, res) => {
  try {
    const { prizeId } = req.params;
    const { title, description, open_date, close_date, is_active } = req.body;

    if (!title || !open_date || !close_date) {
      return res.status(400).json({ msg: 'Title, open_date, and close_date are required' });
    }

    const updated = await updatePrize(prizeId, {
      title,
      description: description ?? null,
      open_date,
      close_date,
      is_active: typeof is_active === 'boolean' ? is_active : true,
    });

    if (!updated) {
      return res.status(404).json({ msg: 'Prize not found' });
    }

    return res.status(200).json({
      msg: 'Prize updated successfully',
      prize: updated,
    });
  } catch (error) {
    console.error('Error updating prize:', error);
    return res
      .status(500)
      .json({ msg: error.message || 'Failed to update prize' });
  }
};

