-- Secure RLS-friendly chat action fallbacks for environments without SUPABASE_SERVICE_ROLE_KEY.

CREATE OR REPLACE FUNCTION public.texweb_edit_direct_message(p_message_id UUID, p_message TEXT)
RETURNS SETOF public.messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing public.messages%ROWTYPE;
BEGIN
  SELECT * INTO existing
  FROM public.messages
  WHERE id = p_message_id
    AND sender_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message not found or not owned by requester.';
  END IF;
  IF existing.is_deleted OR existing.attachment_url IS NOT NULL THEN
    RAISE EXCEPTION 'Only active text messages can be edited.';
  END IF;
  IF existing.created_at < now() - interval '60 seconds' THEN
    RAISE EXCEPTION 'Edit time window has expired.';
  END IF;

  RETURN QUERY
  UPDATE public.messages
  SET message = COALESCE(NULLIF(p_message, ''), message),
      original_message = COALESCE(original_message, existing.message),
      edited_at = now()
  WHERE id = p_message_id
    AND sender_id = auth.uid()
  RETURNING *;
END;
$$;

CREATE OR REPLACE FUNCTION public.texweb_pin_direct_message(p_message_id UUID, p_is_pinned BOOLEAN)
RETURNS SETOF public.messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.messages
  SET is_pinned = COALESCE(p_is_pinned, false)
  WHERE id = p_message_id
    AND sender_id = auth.uid()
    AND COALESCE(is_deleted, false) = false
  RETURNING *;
END;
$$;

CREATE OR REPLACE FUNCTION public.texweb_delete_direct_messages_for_everyone(p_message_ids UUID[])
RETURNS SETOF public.messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.messages
  SET is_deleted = true,
      deleted_at = now(),
      deleted_by = auth.uid(),
      is_pinned = false
  WHERE id = ANY(p_message_ids)
    AND sender_id = auth.uid()
    AND COALESCE(is_deleted, false) = false
  RETURNING *;
END;
$$;

CREATE OR REPLACE FUNCTION public.texweb_edit_batch_message(p_batch_id UUID, p_message_id UUID, p_message TEXT)
RETURNS SETOF public.batch_messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing public.batch_messages%ROWTYPE;
BEGIN
  SELECT * INTO existing
  FROM public.batch_messages
  WHERE id = p_message_id
    AND batch_id = p_batch_id
    AND sender_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Message not found or not owned by requester.';
  END IF;
  IF existing.is_deleted OR existing.attachment_url IS NOT NULL THEN
    RAISE EXCEPTION 'Only active text messages can be edited.';
  END IF;
  IF existing.created_at < now() - interval '60 seconds' THEN
    RAISE EXCEPTION 'Edit time window has expired.';
  END IF;

  RETURN QUERY
  UPDATE public.batch_messages
  SET message = COALESCE(NULLIF(p_message, ''), message),
      original_message = COALESCE(original_message, existing.message),
      edited_at = now()
  WHERE id = p_message_id
    AND batch_id = p_batch_id
    AND sender_id = auth.uid()
  RETURNING *;
END;
$$;

CREATE OR REPLACE FUNCTION public.texweb_pin_batch_message(p_batch_id UUID, p_message_id UUID, p_is_pinned BOOLEAN)
RETURNS SETOF public.batch_messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.can_manage_batch_workspace(p_batch_id) THEN
    RAISE EXCEPTION 'Only batch managers can pin messages.';
  END IF;

  RETURN QUERY
  UPDATE public.batch_messages
  SET is_pinned = COALESCE(p_is_pinned, false)
  WHERE id = p_message_id
    AND batch_id = p_batch_id
    AND COALESCE(is_deleted, false) = false
  RETURNING *;
END;
$$;

CREATE OR REPLACE FUNCTION public.texweb_delete_batch_messages_for_everyone(p_batch_id UUID, p_message_ids UUID[])
RETURNS SETOF public.batch_messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.batch_messages
  SET is_deleted = true,
      deleted_at = now(),
      deleted_by = auth.uid(),
      is_pinned = false
  WHERE id = ANY(p_message_ids)
    AND batch_id = p_batch_id
    AND COALESCE(is_deleted, false) = false
    AND (sender_id = auth.uid() OR public.can_manage_batch_workspace(p_batch_id))
  RETURNING *;
END;
$$;

GRANT EXECUTE ON FUNCTION public.texweb_edit_direct_message(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.texweb_pin_direct_message(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.texweb_delete_direct_messages_for_everyone(UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.texweb_edit_batch_message(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.texweb_pin_batch_message(UUID, UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.texweb_delete_batch_messages_for_everyone(UUID, UUID[]) TO authenticated;
