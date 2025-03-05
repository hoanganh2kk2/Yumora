
const verityEmailTemplate = ({name, url}) => {
  return `
<p>Dear ${name}</p>
<p>Thank you for registering Binkeyit.</p>
<a href=${url} style="color:while;background : blue;margin-top : 10px>
    Verify Email
</a>
`;
};

export default verityEmailTemplate;
