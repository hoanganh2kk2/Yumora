const verifyEmailTemplate = ({ name, url }) => {
  return `
<p>Gửi ${name}</p>    
<p>Cảm ơn bạn đã đăng ký Yumora.</p>   
<a href=${url} style="color:black;background :orange;margin-top : 10px,padding:20px,display:block">
  Xác minh email
</a>
`;
};

export default verifyEmailTemplate;
