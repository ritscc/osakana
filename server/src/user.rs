#[derive(Debug, Clone)]
pub struct User {
    id: String,
    username: Option<String>,
    combo: u32,
}

impl User {
    pub fn new<T>(id: T) -> Self
    where
        T: AsRef<str>,
    {
        User {
            id: id.as_ref().to_string(),
            username: None,
            combo: 0,
        }
    }

    pub fn id(&self) -> &str {
        &self.id
    }

    pub fn combo(&self) -> u32 {
        self.combo
    }

    pub fn increment_combo(&mut self) {
        self.combo += 1;
    }

    pub fn reset_combo(&mut self) {
        self.combo = 0;
    }

    pub fn set_username<T>(&mut self, username: T)
    where
        T: AsRef<str>,
    {
        let username = username.as_ref().to_string();
        self.username = Some(username);
    }
}

#[derive(Clone, Default, Debug)]
pub struct Users(Vec<User>);

impl Users {
    pub fn get_mut<T>(&mut self, user_id: T) -> Option<&mut User>
    where
        T: AsRef<str>,
    {
        self.0.iter_mut().find(|user| user.id == user_id.as_ref())
    }

    pub fn add(&mut self, user: User) {
        self.0.push(user);
    }
}
