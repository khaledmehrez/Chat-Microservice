export const accessToken =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MjFmODU4NjMyYjcwOGI2ZWNiYjE2NDEiLCJlbWFpbCI6ImhlbGxvMUBnbWFpbC5jb20iLCJ1c2VyIjoiNjIxZjg1ZjgwMjJkOTdlOWI2YWUwNTRkIiwicGVuZGluZyI6bnVsbCwicm9sZXMiOlsidXNlciJdLCJpYXQiOjE2NDYyMzY1MTAsImV4cCI6Nzk2OTE1NTg0OX0.-Qc-GP1DzdqV44Au0JZNkl8FUHsTUcUH3Gq4lb1gz3Q';
export const accessTokenUser1 =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MjFmODU4NjMyYjcwOGI2ZWNiYjE2NDEiLCJlbWFpbCI6ImhlbGxvMUBnbWFpbC5jb20iLCJ1c2VyIjoiNjIyMjFiZTM5NTM3NzM5ZTg2NzRkOTgxIiwicm9sZXMiOlsidXNlciJdLCJpYXQiOjE2NDYyMzY1MTAsImV4cCI6Nzk2OTE1NTg0OX0.lCw8SkE_SAlckhuiHt1TcbmjE9_G5zz0qSHGDCVFd9E';
export const accessTokenUser2 =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MjFmODU4NjMyYjcwOGI2ZWNiYjE2NDEiLCJlbWFpbCI6ImhlbGxvMUBnbWFpbC5jb20iLCJ1c2VyIjoiNjIyMjFiZTM5NTM3NzM5ZTg2NzRkOTgyIiwicm9sZXMiOlsidXNlciJdLCJpYXQiOjE2NDYyMzY1MTAsImV4cCI6Nzk2OTE1NTg0OX0.HQpomLsAzrPq86NyQgyPOWj_kdiYc0AAwut-RGZduFY';
export const Message = {
	destination: '62221be39537739e8674d981',
	content: 'Hello',
	conversation: '622778951cf7097c0178c67c',
};
export const EmptyDestination = {
	destination: '',
	content: 'Hello',
	conversation: '622778951cf7097c0178c67c',
};
export const EmptyConversation = {
	destination: '62221be39537739e8674d981',
	content: 'Hello',
	conversation: '',
};
export const EmptyContent = {
	destination: '62221be39537739e8674d981',
	content: '',
	conversation: '622778951cf7097c0178c67c',
};
export const InvalidDestination = {
	destination: '620b99fc3697466b6339604',
	content: 'Hello',
	conversation: '622778951cf7097c0178c67c',
};
export const InvalidConversation = {
	destination: '62221be39537739e8674d981',
	content: 'Hello',
	conversation: '6238604a5249d1e2a36797b',
};
export const WrongDestiantion = {
	destination: '620b99fc3697466b63396047',
	content: 'Hello',
	conversation: '622778951cf7097c0178c67c',
};
export const WrongConversation = {
	destination: '62221be39537739e8674d981',
	content: 'Hello',
	conversation: '6238604a5249d1e2a36797b7',
};
export const Chat = { message: '6218fa3ced69261e61d63eaf', conversation: '622778951cf7097c0178c67c' };
export const Chat1 = { message: '6218fa3ced69261e61d63eae', conversation: '622778951cf7097c0178c67c' };
export const InvalidMessageId = { message: '6218fa3ced69261e61d63df', conversation: '622778951cf7097c0178c67c' };
export const WrongMessageId = { message: '6218fa3ced69261e61d63df7', conversation: '622778951cf7097c0178c67c' };
export const EmptyMessageId = { message: '', conversation: '622778951cf7097c0178c67c' };
export const InvalidConversationId = { message: '6218fa3ced69261e61d63dff', conversation: '622778951cf7097c0178c67' };
export const WrongConversationId = { message: '6218fa3ced69261e61d63dff', conversation: '622778951cf7097c0178c67b' };
export const EmptyConversationId = { message: '6218fa3ced69261e61d63dff', conversation: '' };

export const Conversation = {
	match: '622777d43e18230e8fdf68c1',
	user1: '62221be39537739e8674d982',
	user2: '62221be39537739e8674d980',
};
export const ConversationId = '622778951cf7097c0178c67c';
export const WrongConvId = '622778951cf7097c0178c67a';
export const Reaction = {
	messageId: '6218fa3ced69261e61d63dfd',
	reaction: 'LOVE',
};
export const InvalidReaction = {
	messageId: '6218fa3ced69261e61d63dfd',
	reaction: 'LOV',
};
export const EmptyReaction = {
	messageId: '6218fa3ced69261e61d63dfd',
	reaction: '',
};
export const ReactInvalidMessageId = {
	messageId: '6218fa3ced69261e61d63df',
	reaction: 'LOVE',
};
export const ReactWrongMessageId = {
	messageId: '6218fa3ced69261e61d63dfc',
	reaction: 'LOVE',
};
