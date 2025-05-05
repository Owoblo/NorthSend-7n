-- Drop existing objects if they exist
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;

-- Create wallets table
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('USD', 'CAD')),
    balance DECIMAL(19,4) DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, currency)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'CONVERSION', 'TRANSFER')),
    amount DECIMAL(19,4) NOT NULL,
    currency TEXT NOT NULL CHECK (currency IN ('USD', 'CAD')),
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own wallets" ON public.wallets;
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;

-- Create policies for wallets
CREATE POLICY "Users can view their own wallets"
    ON public.wallets
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets"
    ON public.wallets
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for transactions
CREATE POLICY "Users can view their own transactions"
    ON public.transactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.wallets
            WHERE wallets.id = transactions.wallet_id
            AND wallets.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own transactions"
    ON public.transactions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.wallets
            WHERE wallets.id = transactions.wallet_id
            AND wallets.user_id = auth.uid()
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS wallets_user_id_idx ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS transactions_wallet_id_idx ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON public.transactions(created_at);

-- Grant permissions to authenticated users
GRANT SELECT, UPDATE ON public.wallets TO authenticated;
GRANT SELECT, INSERT ON public.transactions TO authenticated;

-- Create default wallets for existing users
INSERT INTO public.wallets (user_id, currency, balance)
SELECT 
    id as user_id,
    'USD' as currency,
    0 as balance
FROM auth.users
WHERE id NOT IN (
    SELECT user_id FROM public.wallets WHERE currency = 'USD'
)
ON CONFLICT (user_id, currency) DO NOTHING;

INSERT INTO public.wallets (user_id, currency, balance)
SELECT 
    id as user_id,
    'CAD' as currency,
    0 as balance
FROM auth.users
WHERE id NOT IN (
    SELECT user_id FROM public.wallets WHERE currency = 'CAD'
)
ON CONFLICT (user_id, currency) DO NOTHING; 