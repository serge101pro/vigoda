import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type OrgRole = 'admin' | 'manager' | 'employee';
export type SpendingCategory = 'lunch' | 'corporate_event' | 'office_kitchen' | 'other';

interface Organization {
  id: string;
  name: string;
  inn: string | null;
  kpp: string | null;
  legal_address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
}

interface OrgMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgRole;
  monthly_limit: number;
  current_month_spent: number;
  is_active: boolean;
  display_name?: string;
  email?: string;
}

interface OrgBalance {
  id: string;
  organization_id: string;
  balance: number;
}

interface CoopCart {
  id: string;
  organization_id: string;
  name: string;
  deadline_time: string;
  auto_order_time: string;
  is_active: boolean;
  delivery_address: string | null;
}

interface CoopCartItem {
  id: string;
  cart_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  added_by: string;
  spending_category: SpendingCategory;
  created_at: string;
}

export function useOrganization() {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<OrgMember | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [balance, setBalance] = useState<OrgBalance | null>(null);
  const [coopCart, setCoopCart] = useState<CoopCart | null>(null);
  const [coopCartItems, setCoopCartItems] = useState<CoopCartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrganizationData = useCallback(async () => {
    if (!user) {
      setOrganization(null);
      setMembership(null);
      setMembers([]);
      setBalance(null);
      setCoopCart(null);
      setCoopCartItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get user's membership
      const { data: membershipData, error: membershipError } = await supabase
        .from('org_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (membershipError) throw membershipError;
      
      if (!membershipData) {
        setLoading(false);
        return;
      }

      setMembership(membershipData as OrgMember);

      // Get organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', membershipData.organization_id)
        .single();

      if (orgError) throw orgError;
      setOrganization(orgData as Organization);

      // Get all members
      const { data: membersData } = await supabase
        .from('org_members')
        .select('*')
        .eq('organization_id', membershipData.organization_id)
        .eq('is_active', true);

      setMembers((membersData || []) as OrgMember[]);

      // Get balance
      const { data: balanceData } = await supabase
        .from('org_balances')
        .select('*')
        .eq('organization_id', membershipData.organization_id)
        .maybeSingle();

      setBalance(balanceData as OrgBalance | null);

      // Get active coop cart
      const { data: cartData } = await supabase
        .from('coop_carts')
        .select('*')
        .eq('organization_id', membershipData.organization_id)
        .eq('is_active', true)
        .maybeSingle();

      if (cartData) {
        setCoopCart(cartData as CoopCart);

        // Get cart items
        const { data: itemsData } = await supabase
          .from('coop_cart_items')
          .select('*')
          .eq('cart_id', cartData.id)
          .order('created_at', { ascending: false });

        setCoopCartItems((itemsData || []) as CoopCartItem[]);
      }
    } catch (error) {
      console.error('Error fetching organization data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrganizationData();
  }, [fetchOrganizationData]);

  const isAdmin = membership?.role === 'admin';
  const isManager = membership?.role === 'manager';
  const isEmployee = membership?.role === 'employee';
  const hasOrgAccess = !!organization;

  const addToCoopCart = async (item: Omit<CoopCartItem, 'id' | 'cart_id' | 'created_at' | 'added_by'>) => {
    if (!user || !coopCart) return false;

    try {
      const { error } = await supabase
        .from('coop_cart_items')
        .insert({
          cart_id: coopCart.id,
          added_by: user.id,
          ...item
        });

      if (error) throw error;
      await fetchOrganizationData();
      return true;
    } catch (error) {
      console.error('Error adding to coop cart:', error);
      return false;
    }
  };

  const removeFromCoopCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('coop_cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await fetchOrganizationData();
      return true;
    } catch (error) {
      console.error('Error removing from coop cart:', error);
      return false;
    }
  };

  const getRemainingLimit = () => {
    if (!membership) return 0;
    return membership.monthly_limit - membership.current_month_spent;
  };

  const getCoopCartTotal = () => {
    return coopCartItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const getTimeUntilDeadline = () => {
    if (!coopCart) return null;
    const now = new Date();
    const [hours, minutes] = coopCart.deadline_time.split(':').map(Number);
    const deadline = new Date();
    deadline.setHours(hours, minutes, 0, 0);
    
    if (deadline <= now) {
      deadline.setDate(deadline.getDate() + 1);
    }
    
    const diff = deadline.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours: hoursLeft, minutes: minutesLeft };
  };

  return {
    organization,
    membership,
    members,
    balance,
    coopCart,
    coopCartItems,
    loading,
    isAdmin,
    isManager,
    isEmployee,
    hasOrgAccess,
    addToCoopCart,
    removeFromCoopCart,
    getRemainingLimit,
    getCoopCartTotal,
    getTimeUntilDeadline,
    refetch: fetchOrganizationData
  };
}
